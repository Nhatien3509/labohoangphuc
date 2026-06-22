# AI Agent Prompt — Schema Registry Integration
> Project: `adm-srv-go-api` · Feature: Register Avro Schema via HTTP API

---

## Role & Context

Bạn là Senior Go Engineer chuyên về event-driven architecture và data serialization.
Bạn có kinh nghiệm làm việc với **Confluent Schema Registry REST API** và định dạng **Apache Avro** trong hệ thống Kafka production.

**Project hiện tại:**

| Thông tin | Giá trị |
|---|---|
| Module name | `adm-srv-go-api` |
| Go version | `1.22+` |
| HTTP Framework | `gin-gonic/gin` |
| Logger | `go.uber.org/zap` — wrapper tại `pkg/logger/` |
| Config loader | `internal/config/config.go` — dùng `viper` + `godotenv` |
| Entry point | `cmd/api/main.go` |
| Kiến trúc | `handler → service → repository` (không dùng global state) |

**Avro schema file cần đăng ký:** `rule-kho-mo.avsc`
(file sẽ được đặt tại `schema-registry/rule-kho-mo.avsc` trong project root)

---

## Task

Xây dựng tính năng **đăng ký Avro schema lên Confluent Schema Registry** thông qua HTTP API nội bộ.

Luồng hoạt động:
```
Client gọi POST /api/v1/schemas/register
    → SchemaHandler đọc file .avsc từ disk
    → SchemaRegistryService gọi Schema Registry REST API
    → Trả về schema ID được cấp bởi Registry
```

Không thay đổi bất kỳ file hiện có nào — chỉ **thêm mới** và **chỉnh sửa đúng các điểm nối** đã chỉ định.

---

## Specification chi tiết

### File 1 — `schema-registry/rule-kho-mo.avsc` (đã tạo)

---

### File 2 — `internal/config/config.go` (chỉnh sửa — CHỈ THÊM, không xóa)

**Thêm vào struct `Config`** (sau field `KafkaBrokers`):

```go
// Schema Registry
SchemaRegistryURL      string `mapstructure:"SCHEMA_REGISTRY_URL"`
SchemaRegistryUser     string `mapstructure:"SCHEMA_REGISTRY_USER"`
SchemaRegistryPassword string `mapstructure:"SCHEMA_REGISTRY_PASSWORD"`
SchemaDir              string `mapstructure:"SCHEMA_DIR"`
```

**Thêm vào `LoadConfig()`** (sau dòng SetDefault của Kafka):

```go
viper.SetDefault("SCHEMA_REGISTRY_URL", "http://localhost:8081")
viper.SetDefault("SCHEMA_DIR",          "schema-registry")
```

**Thêm vào `AppConfig = &Config{...}`**:

```go
SchemaRegistryURL:      viper.GetString("SCHEMA_REGISTRY_URL"),
SchemaRegistryUser:     viper.GetString("SCHEMA_REGISTRY_USER"),
SchemaRegistryPassword: viper.GetString("SCHEMA_REGISTRY_PASSWORD"),
SchemaDir:              viper.GetString("SCHEMA_DIR"),
```

---

### File 3 — `internal/model/schema_registry.go` (cần **override** — file hiện tại thiếu struct)

Định nghĩa các struct dùng cho request/response:

```go
// RegisterSchemaRequest là request body từ HTTP client gửi lên API.
// Subject mặc định theo convention Kafka: "<topic-name>-value"
type RegisterSchemaRequest struct {
    Subject    string `json:"subject"`              // vd: "rule-kho-mo-value"
    SchemaFile string `json:"schema_file"`          // vd: "rule-kho-mo.avsc"
    SchemaType string `json:"schema_type,omitempty"` // mặc định "AVRO"
}

// RegisterSchemaResponse là response trả về cho HTTP client sau khi đăng ký thành công.
type RegisterSchemaResponse struct {
    ID      int    `json:"id"`       // Schema ID do Registry cấp (duy nhất toàn cluster)
    Subject string `json:"subject"`
    Version int    `json:"version"`  // Phiên bản schema trong subject (bắt đầu từ 1)
}

// schemaRegistryPayload là body gửi đến Schema Registry REST API.
// Schema Registry chỉ nhận {"schemaType": "AVRO", "schema": "<escaped-json-string>"}
type schemaRegistryPayload struct {
    SchemaType string `json:"schemaType"`
    Schema     string `json:"schema"`     // Nội dung .avsc dưới dạng JSON string (escaped)
}

// schemaRegistryIDResponse là response từ POST /subjects/{subject}/versions.
type schemaRegistryIDResponse struct {
    ID int `json:"id"`
}

// schemaRegistryVersionResponse là response từ GET /subjects/{subject}/versions/latest.
type schemaRegistryVersionResponse struct {
    Subject string `json:"subject"`
    Version int    `json:"version"`
    ID      int    `json:"id"`
    Schema  string `json:"schema"`
}
```

---

### File 4 — `internal/service/schema_registry/service.go` (tạo mới)

**Interface:**

```go
type SchemaRegistryService interface {
    RegisterSchema(subject, schemaFile, schemaType string) (*model.RegisterSchemaResponse, error)
    GetLatestSchema(subject string) (*model.RegisterSchemaResponse, error)
}
```

**Struct và Constructor:**

```go
type schemaRegistryService struct {
    baseURL    string       // URL Schema Registry, vd: http://host:8081
    username   string       // Basic auth username (rỗng nếu không auth)
    password   string       // Basic auth password
    schemaDir  string       // Thư mục chứa file .avsc, vd: "schemas"
    httpClient *http.Client // Client với timeout cố định
}

func NewSchemaRegistryService(cfg *config.Config) SchemaRegistryService {
    return &schemaRegistryService{
        baseURL:   strings.TrimRight(cfg.SchemaRegistryURL, "/"),
        username:  cfg.SchemaRegistryUser,
        password:  cfg.SchemaRegistryPassword,
        schemaDir: cfg.SchemaDir,
        httpClient: &http.Client{Timeout: 15 * time.Second},
    }
}
```

**Phương thức `RegisterSchema`:**

Logic theo thứ tự:

1. **Đọc file schema từ disk:**
   - Ghép đường dẫn: `filepath.Join(s.schemaDir, schemaFile)`
   - Đọc bằng `os.ReadFile(path)`
   - Nếu lỗi → wrap error: `"không thể đọc file schema '%s': %w"`

2. **Validate JSON hợp lệ:**
   - Dùng `json.Valid(content)` để kiểm tra file .avsc là JSON hợp lệ
   - Nếu không hợp lệ → return error: `"file schema '%s' không phải JSON hợp lệ"`

3. **Chuẩn bị payload cho Schema Registry:**
   - `schemaType` mặc định là `"AVRO"` nếu tham số rỗng
   - Tạo `schemaRegistryPayload{SchemaType: schemaType, Schema: string(content)}`
   - Marshal sang JSON

4. **Gọi Schema Registry REST API:**
   - Method: `POST`
   - URL: `{baseURL}/subjects/{subject}/versions`
   - Header: `Content-Type: application/vnd.schemaregistry.v1+json`
   - Nếu `username != ""` → set Basic Auth bằng `req.SetBasicAuth()`
   - Parse response body → `schemaRegistryIDResponse`
   - Xử lý HTTP status:
     - `200` hoặc `409` (schema đã tồn tại, idempotent) → thành công
     - Các status khác → return error kèm body response

5. **Lấy version từ Registry** (sau khi có ID):
   - Gọi `GET {baseURL}/subjects/{subject}/versions/latest`
   - Parse `schemaRegistryVersionResponse`
   - Tổng hợp và return `*model.RegisterSchemaResponse{ID, Subject, Version}`

**Phương thức `GetLatestSchema`:**
- Gọi `GET {baseURL}/subjects/{subject}/versions/latest`
- Parse và return `*model.RegisterSchemaResponse`
- Xử lý 404 → return error rõ ràng: `"subject '%s' chưa được đăng ký"`

**Yêu cầu xử lý lỗi:**
- Luôn `defer resp.Body.Close()` ngay sau khi nhận response
- Đọc body lỗi bằng `io.ReadAll` trước khi return error để có context
- Wrap error với `fmt.Errorf("...: %w", err)`

---

### File 5 — `internal/handler/schema-registry/handler.go` (tạo mới)

```go
type SchemaHandler struct {
    svc service.SchemaRegistryService
}

func NewSchemaHandler(svc service.SchemaRegistryService) *SchemaHandler
```

**Handler `RegisterSchema` — `POST /api/v1/schemas/register`:**

- Bind JSON vào `model.RegisterSchemaRequest`
- Validate: `subject` và `schema_file` không được rỗng → 400
- Validate: `schema_file` phải có đuôi `.avsc` → 400 `"schema_file phải là file .avsc"`
- Gọi `h.svc.RegisterSchema(req.Subject, req.SchemaFile, req.SchemaType)`
- Response 200: trả về `model.RegisterSchemaResponse`
- Response 500: `{"error": "<message>"}`

**Handler `GetLatestSchema` — `GET /api/v1/schemas/:subject`:**

- Đọc `subject` từ `c.Param("subject")`
- Gọi `h.svc.GetLatestSchema(subject)`
- Response 200: trả về `model.RegisterSchemaResponse`
- Response 404/500 tùy loại lỗi

---

### File 6 — `cmd/api/main.go` (chỉnh sửa — CHỈ THÊM vào đúng vị trí)

**Thêm đoạn 1** — sau dòng `kafkaSvc := service.NewKafkaService(...)`:

```go
// Khởi tạo SchemaRegistryService để đăng ký Avro schema lên Registry.
schemaSvc := service.NewSchemaRegistryService(config.AppConfig)
```

**Thêm đoạn 2** — sau dòng `kafkaHandler := handler.NewKafkaHandler(...)`:

```go
schemaHandler := handler.NewSchemaHandler(schemaSvc)
```

**Thêm đoạn 3** — trong block `api := r.Group("/api/v1")`, sau route kafka:

```go
// Schema Registry
api.POST("/schemas/register",   schemaHandler.RegisterSchema)
api.GET("/schemas/:subject",    schemaHandler.GetLatestSchema)
```

---

### File 7 — `.env` (chỉ thêm dòng, không xóa)

```env
# Schema Registry
SCHEMA_REGISTRY_URL=http://160.191.32.193:8081
SCHEMA_REGISTRY_USER=
SCHEMA_REGISTRY_PASSWORD=
SCHEMA_DIR=schema-registry
```

---

## API Contract

### `POST /api/v1/schemas/register`

**Request:**
```json
{
  "subject":     "rule-kho-mo-value",
  "schema_file": "rule-kho-mo.avsc",
  "schema_type": "AVRO"
}
```

**Response 200:**
```json
{
  "id":      42,
  "subject": "rule-kho-mo-value",
  "version": 1
}
```

**Response 400:**
```json
{ "error": "schema_file phải là file .avsc" }
```

---

### `GET /api/v1/schemas/rule-kho-mo-value`

**Response 200:**
```json
{
  "id":      42,
  "subject": "rule-kho-mo-value",
  "version": 1
}
```

---

## Constraints bắt buộc

| # | Ràng buộc |
|---|---|
| 1 | `go build ./...` không lỗi — không cần thêm dependency ngoài (chỉ dùng `net/http`, `encoding/json`, `os`, `io`, `strings`, `path/filepath`) |
| 2 | KHÔNG dùng `init()` global — khởi tạo trong `main()`, truyền qua DI |
| 3 | KHÔNG hardcode URL hay credentials — luôn đọc từ `config.AppConfig` |
| 4 | `defer resp.Body.Close()` bắt buộc sau mọi HTTP response |
| 5 | Xử lý idempotent: Schema Registry trả `409` → không phải lỗi, vẫn return thành công |
| 6 | Mọi comment viết bằng **tiếng Việt**, giải thích "tại sao" chứ không chỉ "làm gì" |
| 7 | Không bỏ qua `err` bằng `_` ở bất kỳ đâu |
| 8 | Import path dùng đúng module name: `"adm-srv-go-api/internal/..."` |
| 9 | Content-Type gửi lên Registry phải là `application/vnd.schemaregistry.v1+json` (không phải `application/json`) |

---

## Output yêu cầu (theo thứ tự)

```
1. schema-registry/rule-kho-mo.avsc
2. internal/model/schema_registry.go
3. internal/service/schema-registry/service.go
4. internal/handler/schema-registry/handler.go
5. Diff cho internal/config/config.go  (chỉ phần thêm)
6. Diff cho cmd/api/main.go            (chỉ phần thêm)
7. .env additions
```
