# Hướng dẫn Provision Luồng Thu Thập Kho Dữ Liệu

## Tổng quan

Mỗi loại dữ liệu (vd: BCT_001) cần được "provision" trước khi data chảy vào kho. Provision = tạo 3 thứ theo đúng thứ tự:

```
1. HDFS path  →  2. Hive/Iceberg table  →  3. NiFi flow
```

---

## Các bên tham gia

| Bên | Vai trò |
|-----|---------|
| **Admin Nền tảng** | Đăng ký loại DL, upload schema, bấm Duyệt, fill config |
| **Admin Kho (Warehouse)** | Nhận XML đã fill → thực thi tạo hạ tầng |
| **GoGenApi** | Sinh tự động artifact từ Excel schema |
| **NiFi** | Chạy flow thu thập data |

---

## Bước 0 — Làm 1 lần duy nhất (NiFi Admin)

Tạo **Parameter Context** trên NiFi cluster tên `env-cdp-prod`:

| Parameter | Giá trị |
|-----------|---------|
| `bootstrap.servers` | địa chỉ Kafka CDP |
| `schema.registry.url` | URL Hortonworks Schema Registry |
| `grpc.host` | host của data-warehouse-go |
| `grpc.port` | port của data-warehouse-go |
| `error.topic` | tên topic nhận error logs |

> Các giá trị này dùng chung cho TẤT CẢ flow — chỉ set 1 lần.

---

## Bước 1 — Admin Nền tảng: Đăng ký loại DL

1. Upload file Excel schema (7 cột) lên `POST /generate` của GoGenApi
2. Hệ thống tự sinh 6 artifact và lưu vào DB:
   - `json_schema` — schema validate dữ liệu đầu vào
   - `iceberg_ddl` — câu SQL tạo Iceberg table
   - `nifi_xml` — NiFi flow XML (chưa fill placeholder)
   - `avro_hive`, `avro_platform`, `iceberg_schema`
3. Loại DL xuất hiện trong danh sách với status `draft`

---

## Bước 2 — Admin Nền tảng: Bấm Duyệt + Fill config

Khi bấm **Duyệt** một loại DL, admin nhập **2 giá trị bắt buộc**:

| Field | Ví dụ | Ghi chú |
|-------|-------|---------|
| **Mã kết nối** (`MA_KET_NOI`) | `BCT001_TT` | Tên table Iceberg + tên flow NiFi |
| **Schema Registry Name** | `schemaregistry-45` | Tên schema đã đăng ký trên Hortonworks SR |

Các giá trị còn lại **tự động sinh**:

| Field | Sinh từ | Ví dụ |
|-------|---------|-------|
| `TOPIC_CDP` | `{MA_KET_NOI}_DuLieu` | `BCT001_TT_DuLieu` |
| `GROUP_ID` | `nifi-{MA_KET_NOI}` | `nifi-BCT001_TT` |
| `ZONE` | default `zone2` | `zone2` |
| `JSON_SCHEMA` | DB → `json_schema` jsonb | tự fill |
| `DESCRIPTOR_PATHS` | DB → `iceberg_schema` jsonb | tự fill |
| `RECORD_PATHS` | DB → `nifi_xml` jsonb | tự fill |
| `ATTR_LIST` | DB → `nifi_xml` jsonb | tự fill |

Sau khi fill xong, hệ thống gửi XML đã điền đầy đủ qua Kong → Admin Kho.

---

## Bước 3 — Admin Kho: Thực thi provision

Admin Kho nhận request từ Admin Nền tảng qua Kong API, thực hiện tuần tự:

### 3.1 Tạo HDFS path
```bash
hdfs dfs -mkdir -p /data/warehouse/{ZONE}/{MA_KET_NOI}/
hdfs dfs -chmod 755 /data/warehouse/{ZONE}/{MA_KET_NOI}/
```

### 3.2 Tạo Iceberg table (chạy trên Hive/Beeline)
```sql
-- Lấy DDL từ iceberg_ddl jsonb trong DB, đã fill placeholder
-- Ví dụ kết quả sau fill:
CREATE TABLE IF NOT EXISTS zone2.BCT001_TT (
    id                     string,
    ten_doanh_nghiep       string,
    ...
    meta_id_nguon_du_lieu  string,
    meta_phien_ban         int,
    raw_json               string
)
STORED BY 'org.apache.iceberg.mr.hive.HiveIcebergStorageHandler'
LOCATION '/data/warehouse/zone2/BCT001_TT/'
PARTITIONED BY (year(meta_ngay_hieu_luc), month(meta_ngay_hieu_luc))
TBLPROPERTIES ('format-version'='2', 'write.dedup.key'='id,meta_phien_ban');
```

### 3.3 Upload và start NiFi flow
```
POST /nifi-api/process-groups/{root-pg-id}/templates/upload
  body: XML đã fill đầy đủ

POST /nifi-api/process-groups/{root-pg-id}/template-instance
  body: { templateId, originX, originY }
  → gắn vào Parameter Context "env-cdp-prod"

PUT /nifi-api/flow/process-groups/{new-pg-id}
  body: { id, state: "RUNNING" }
```

---

## Bước 4 — Verify

Sau provision, kiểm tra:

- [ ] HDFS path tồn tại: `hdfs dfs -ls /data/warehouse/{ZONE}/{MA_KET_NOI}/`
- [ ] Hive table tồn tại: `SHOW TABLES IN {ZONE} LIKE '{MA_KET_NOI}'`
- [ ] NiFi flow hiển thị trên UI, status `Running`
- [ ] ConsumeKafka đang poll topic `{TOPIC_CDP}`
- [ ] Sau vài phút: `SELECT COUNT(*) FROM {ZONE}.{MA_KET_NOI}` > 0

---

## Cấu trúc NiFi flow (6 processor)

```
ConsumeKafka_2_0({TOPIC_CDP})
        ↓ success
ValidateRecord (avro_hive schema từ Schema Registry)
        ↓ valid
ValidateJson (json_schema)
        ↓ valid
EvaluateJsonPath (envelope → meta_* + raw_json)
        ↓ matched
SplitJson ($.duLieuChiTiet → 1 record/flowfile)
        ↓ split
EvaluateJsonPath (record camelCase → snake_case columns)
        ↓ matched
AttributesToJSON (gom columns thành JSON body)
        ↓ success
PutIceberg (zone2.{MA_KET_NOI}, PARQUET, 128MB file)

Failure path → InvokeGRPC (data-warehouse-go) → PublishKafka ({ERROR_TOPIC})
```

---

## Lưu ý hiệu năng

- Mỗi flow có `max.poll.records=500` — giới hạn memory, tránh OOM khi nhiều flow song song
- Mỗi flow có `maximum-file-size=128MB` trên PutIceberg — tránh small files trên HDFS
- Mỗi topic nên có **3 partition** (= số NiFi node) để consumer không idle
- Consumer group tự tạo khi flow start — không cần tạo trước trên Kafka

---

## Rollback nếu provision thất bại

| Bước thất bại | Rollback |
|---------------|---------|
| HDFS | `hdfs dfs -rm -r /data/warehouse/{ZONE}/{MA_KET_NOI}/` |
| Hive table | `DROP TABLE IF EXISTS {ZONE}.{MA_KET_NOI}` |
| NiFi flow | Xóa Process Group trên NiFi UI hoặc `DELETE /nifi-api/process-groups/{id}` |
