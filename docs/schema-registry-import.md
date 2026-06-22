Bạn là một Senior Golang Backend Engineer, có chuyên môn sâu về kiến trúc
Microservices, Kafka, Confluent Schema Registry và Clean Architecture.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TỔNG QUAN KIẾN TRÚC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hệ thống gồm 2 service:
- admin-service    : tiếp nhận file xlsx, sinh Avro, đăng ký Schema Registry, lưu JSON
                     validation rules vào PostgreSQL của chính nó.
- integration-service: khi sync pipeline chạy, tự load validation rules từ PostgreSQL
                       (của admin-service DB hoặc shared DB) vào sync.Map in-memory.
                       Không có bước Redis nào liên quan đến validation rules. Ko xử lý gì liên quan đến api này

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MỤC TIÊU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Triển khai API POST /api/v1/schemas/register trong admin-service.
API thực hiện 2 việc song song từ một file .xlsx:
  1. Sinh Avro Schema → đăng ký lên Confluent Schema Registry.
  2. Sinh JSON Validation Rules → lưu vào PostgreSQL (nguồn sự thật).
Hai artifact này TÁCH BIỆT hoàn toàn — Avro chỉ đi lên Registry,
JSON chỉ lưu vào DB. Không trộn lẫn.

LƯU Ý NGHIỆP VỤ: Đây là API Import cấu hình thuần túy.
Tuyệt đối không đưa logic validate runtime vào đây.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Request format: multipart/form-data
Form fields:
  - subject        (string, bắt buộc) : tên subject Schema Registry, vd "nguoi-dan-value"
  - nguon_du_lieu  (string, bắt buộc) : mã nguồn dữ liệu, vd "CDLQG", "KHO_MO"
  - file           (file,   bắt buộc) : file .xlsx

Cấu trúc file .xlsx (đọc sheet đầu tiên bằng excelize, bỏ dòng 1 là header):
  Cột 0 : TT          — số thứ tự, hỗ trợ dạng "1", "2", "4", "4.1", "4.2" (xem nested)
  Cột 1 : Tên trường  — field_name (string)
  Cột 2 : Định dạng   — type: string | int | long | float | double | boolean | object
  Cột 3 : Độ dài      — max_length (int, chỉ áp dụng khi type=string)
  Cột 4 : Bắt buộc   — 1=required, 0=optional
  Cột 5 : Mô tả      — description (string)

QUY TẮC NESTED OBJECT (quan trọng):
  - Dòng có TT là số nguyên (vd "4", type="object") → đây là PARENT field.
  - Dòng có TT dạng "4.1", "4.2" → là CHILDREN của parent TT "4".
  - Children chỉ có thể sâu 1 cấp (không có "4.1.1").
  - Khi gặp TT số nguyên mới (vd "5") → object "4" đã kết thúc.

Ví dụ file:
  TT   | Tên trường       | Định dạng | Độ dài | Bắt buộc | Mô tả
  1    | IdNguonDuLieu    | string    | 10     | 1        | Mã nguồn
  2    | TenGoi           | string    | 255    | 0        | Tên gọi
  3    | NamSinh          | int       |        | 0        | Năm sinh
  4    | DiaChi           | object    |        | 0        | Địa chỉ
  4.1  | TinhThanh        | string    | 100    | 1        | Tỉnh/Thành
  4.2  | QuanHuyen        | string    | 100    | 0        | Quận/Huyện
  5    | NgayTao          | string    | 30     | 1        | ISO 8601

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. LUỒNG SERVICE (Controller → Service → Repository)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bước 1 — Validate input
  - subject, nguon_du_lieu không rỗng.
  - File phải có extension .xlsx.
  - Trả 400 nếu thiếu.

Bước 2 — Parse .xlsx
  Dùng github.com/xuri/excelize/v2.
  Đọc sheet đầu tiên (GetSheetName(0)), bỏ dòng header (row index 1).
  Trim space tất cả các cell.
  Xây dựng cây field theo logic nested:
    - Duyệt từng row, đọc cột TT.
    - Nếu TT không chứa dấu "." → là top-level field (hoặc parent nếu type=object).
    - Nếu TT chứa dấu "." → lấy phần trước dấu "." là parent TT,
      append vào Children của parent đó.
  Kết quả: []ParsedField (slice giữ thứ tự đọc từ file).

  Struct ParsedField:
    FieldOrder   string
    FieldName    string
    Type         string        // "string"|"int"|"long"|"float"|"double"|"boolean"|"object"
    MaxLength    *int
    Required     bool
    Description  string
    Children     []ParsedField // chỉ có giá trị khi Type="object"

Bước 3 — Sinh Avro Schema JSON string
  Dựa vào []ParsedField, xây dựng Avro schema theo chuẩn:
  {
    "type":      "record",
    "name":      "<PascalCase từ subject, bỏ suffix '-value'>",
    "namespace": "dmst.integration",
    "fields":    [...]
  }

  Mapping type sang Avro type:
    string  → "string"
    int     → "int"
    long    → "long"
    float   → "float"
    double  → "double"
    boolean → "boolean"
    object  → inline record (xem ví dụ nested bên dưới)

  Required=true  → "type": "<avro_type>"
  Required=false → "type": ["null", "<avro_type>"], "default": null

  Nested object (ví dụ field DiaChi chứa TinhThanh, QuanHuyen):
  {
    "name": "DiaChi",
    "type": ["null", {
      "type": "record",
      "name": "DiaChiRecord",
      "fields": [
        { "name": "TinhThanh", "type": "string" },
        { "name": "QuanHuyen", "type": ["null", "string"], "default": null }
      ]
    }],
    "default": null
  }

Bước 4 — Gọi Schema Registry
  POST {SCHEMA_REGISTRY_URL}/subjects/{subject}/versions
  Header: Content-Type: application/vnd.schemaregistry.v1+json
  Body: { "schemaType": "AVRO", "schema": "<escaped avro json string>" }
  Basic auth nếu có username/password trong config.

  Xử lý response:
    HTTP 200 → parse { "id": <int> } → lấy schema_id
    HTTP 409 → schema không đổi, idempotent →
               GET /subjects/{subject}/versions/latest → lấy id + version
    Khác     → trả lỗi 502 Bad Gateway kèm message từ Registry

Bước 5 — Lưu PostgreSQL (Upsert)
  Model SchemaMetadata:
    id               SERIAL PRIMARY KEY
    subject          VARCHAR(255) UNIQUE NOT NULL
    nguon_du_lieu    VARCHAR(100) NOT NULL
    schema_id        INT NOT NULL              -- ID trả về từ Schema Registry
    schema_version   INT NOT NULL              -- version trả về từ GET /latest
    status           VARCHAR(20) DEFAULT 'ACTIVE'
    validation_rules JSONB NOT NULL            -- JSON Validation Rules (xem cấu trúc bên dưới)
    source_xlsx      BYTEA                     -- raw bytes của file gốc để audit
    created_at       TIMESTAMP DEFAULT NOW()
    updated_at       TIMESTAMP DEFAULT NOW()

  Upsert: conflict trên subject →
    UPDATE schema_id, schema_version, nguon_du_lieu, validation_rules, source_xlsx, updated_at

  Cấu trúc validation_rules (JSONB) — tách biệt với Avro:
  {
    "fields": [
      {
        "field_order": "1",
        "field_name":  "IdNguonDuLieu",
        "type":        "string",
        "required":    true,
        "max_length":  10,
        "description": "Mã nguồn",
        "children":    null
      },
      {
        "field_order": "4",
        "field_name":  "DiaChi",
        "type":        "object",
        "required":    false,
        "max_length":  null,
        "description": "Địa chỉ",
        "children": [
          {
            "field_order": "4.1",
            "field_name":  "TinhThanh",
            "type":        "string",
            "required":    true,
            "max_length":  100,
            "description": "Tỉnh/Thành",
            "children":    null
          }
        ]
      }
    ]
  }

Bước 6 — Notify integration-service invalidate cache (non-blocking)
  Sau khi lưu DB thành công, chạy trong goroutine riêng:
    DELETE {INGEST_SERVICE_URL}/api/v1/schemas/cache/{subject}
  Nếu thất bại → logger.Warn("cache invalidate thất bại", ...) — KHÔNG fail request.
  (integration-service sẽ tự reload từ DB lần tiếp theo pipeline chạy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  400 Bad Request   → thiếu param, file sai định dạng, lỗi parse xlsx
  502 Bad Gateway   → Schema Registry trả lỗi không phải 200/409
  500 Internal      → lỗi DB
  200 OK            → thành công (kể cả cache invalidate thất bại)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. RESPONSE (HTTP 201 Created)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "schema_id":        123,
  "schema_version":   3,
  "subject":          "nguoi-dan-value",
  "nguon_du_lieu":    "CDLQG",
  "field_count":      12,      // tổng số field top-level
  "cache_invalidated": true    // false nếu notify integration-service thất bại
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. YÊU CẦU KỸ THUẬT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Pattern: Handler → Service → Repository (Clean Architecture).
- Tách model Input/Output (request/response DTO) với model DB (GORM struct).
- Dùng GORM clause.OnConflict cho Upsert.
- Dùng datatypes.JSON (gorm.io/datatypes) cho cột validation_rules JSONB.
- Thư viện parse xlsx: github.com/xuri/excelize/v2
- Trim space toàn bộ cell khi đọc xlsx.
- Avro schema sinh dưới dạng string (json.Marshal) trước khi gửi Registry.
- validation_rules lưu DB là []FieldRule struct (slice, giữ thứ tự) — KHÔNG dùng map.
- Không import thêm Redis dependency vào admin-service.
- Sinh code cho: model/, repository/, service/, handler/ và hướng dẫn
  đăng ký route + AutoMigrate trong main.go.