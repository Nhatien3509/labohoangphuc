# AI Agent Prompt — Kho Mở Forward & Schema Validation (Corrected Flow)
> Luồng: `adm-srv-go-api` fetch mock data → gọi endpoint MỚI của `dmst-integration-ingest` → validate Avro schema → publish Kafka

---

## Role & Context

Bạn là Senior Go Engineer chuyên về service-to-service communication và data pipeline.
Bạn viết code production-ready: clean architecture, error handling đầy đủ, không global state.

### Project A — `adm-srv-go-api` (port 8080)

| | |
|---|---|
| Module | `adm-srv-go-api` |
| Go | `1.26.2` |
| Framework | `gin-gonic/gin` |
| Logger | `go.uber.org/zap` — wrapper tại `pkg/logger/` (dùng hàm global `logger.Info(...)`) |
| Config | `internal/config/config.go` — viper + godotenv |
| Entry point | `cmd/api/main.go` |

**Files liên quan đã có:**
- `internal/handler/kho-du-lieu-mo/handler.go` — `GetMockData()` đọc `json/api_kho_mo.json` trả raw JSON
- `internal/model/kho_mo_kafka.go` — struct `KhoMoApiResponse` (đã map với `rule-kho-mo.avsc`)
- `internal/config/config.go` — đã có `SchemaRegistryURL`, `SchemaDir`, `KafkaBrokers`

**Struct `KhoMoApiResponse` hiện tại (KHÔNG thay đổi):**
```go
type KhoMoApiResponse struct {
    ID              *string  `avro:"id"              json:"id"`
    Succeeded       bool     `avro:"succeeded"       json:"succeeded"`
    Errors          []string `avro:"errors"          json:"errors"`
    TraceId         string   `avro:"traceId"         json:"traceId"`
    Page            int32    `avro:"page"            json:"page"`
    Size            int32    `avro:"size"            json:"size"`
    Count           int32    `avro:"count"           json:"count"`
    DataNguonDuLieu string   `avro:"dataNguonDuLieu" json:"dataNguonDuLieu"`
}
```

**Cấu trúc `json/api_kho_mo.json` (tóm tắt):**
```json
{
  "succeeded": true,
  "errors": [],
  "traceId": "abc-123",
  "page": 1,
  "size": 10,
  "count": 5,
  "data": {
    "items": [ { "id": "...", "ten": "...", ... } ]
  }
}
```

---

### Project B — `dmst-integration-ingest` (port 8081)

| | |
|---|---|
| Module | `dmst-integration-ingest` |
| Go | `1.26.2` |
| Framework | `gin-gonic/gin` |
| Logger | `*zap.Logger` instance — KHÔNG dùng global wrapper, phải inject qua constructor |
| Config | `internal/config/config.go` — viper + godotenv |
| Entry point | `cmd/ingest/main.go` |

**Endpoint đã có (KHÔNG được sửa):**
```
POST /api/v1/push/:datasourceID   → JobHandler.Push → jobSvc.Push → ingestSvc.Push → Kafka
POST /api/v1/jobs/trigger/:id     → JobHandler.Trigger → ...
```

**Dependency đã có trong `go.mod`:**
- `github.com/segmentio/kafka-go`
- `go.opentelemetry.io/otel`
- `gorm.io/gorm`
- `go.uber.org/zap`

**Dependency cần thêm:**
```bash
go get github.com/hamba/avro/v2@v2.27.0
```

---

## Luồng đúng

```
[Client]
    │
    ▼
POST /api/v1/kho-mo/ingest          ← adm-srv-go-api (handler MỚI)
    │
    ├─ Đọc json/api_kho_mo.json
    ├─ Map raw JSON → KhoMoApiResponse
    └─ HTTP POST → dmst-integration-ingest
                   /api/v1/kho-mo/receive  ← endpoint MỚI, độc lập hoàn toàn
                            │
                            ├─ KhoMoHandler.Receive()   ← handler MỚI
                            ├─ KhoMoService.Process()   ← service MỚI
                            │       ├─ SchemaValidatorService.Validate()
                            │       │       ├─ Fetch schema từ Registry
                            │       │       ├─ Parse Avro schema (hamba/avro)
                            │       │       └─ Validate JSON conform schema
                            │       │
                            │       └─ [NẾU VALID] kafka.Writer.WriteMessages()
                            │
                            └─ Response: {job_id, status, records_published}
```

**Nguyên tắc:** Project B tạo stack handler/service hoàn toàn mới, KHÔNG can thiệp vào
flow `push/:datasourceID` đang hoạt động.

---

## PHẦN 1 — `adm-srv-go-api`

### File 1.1 — `internal/config/config.go` (chỉ THÊM)

Thêm vào struct `Config` (sau `SchemaDir`):
```go
// Ingest Service
IngestServiceURL   string `mapstructure:"INGEST_SERVICE_URL"`
```

Thêm default vào `LoadConfig()`:
```go
viper.SetDefault("INGEST_SERVICE_URL",    "http://localhost:8081")
```

Thêm vào `AppConfig = &Config{...}`:
```go
IngestServiceURL: viper.GetString("INGEST_SERVICE_URL"),
```

---

### File 1.2 — `internal/service/kho-mo-forward/service.go` (TẠO MỚI)

**Interface:**
```go
type KhoMoForwardService interface {
    FetchAndForward(ctx context.Context) (*KhoMoForwardResult, error)
}

type KhoMoForwardResult struct {
    Message         string `json:"message"`
    RecordsForwarded int   `json:"records_forwarded"`
}
```

**Struct và constructor:**
```go
type khoMoForwardSvc struct {
    jsonFilePath string       // "json/api_kho_mo.json"
    ingestURL    string       // URL ingest service, vd: http://host:8081
    httpClient   *http.Client
}

func NewKhoMoForwardService(cfg *config.Config) KhoMoForwardService {
    return &khoMoForwardSvc{
        jsonFilePath: "json/api_kho_mo.json",
        ingestURL:    strings.TrimRight(cfg.IngestServiceURL, "/"),
        httpClient:   &http.Client{Timeout: 30 * time.Second},
    }
}
```

**Phương thức `FetchAndForward(ctx context.Context)`:**

Bước 1 — Đọc và parse file JSON:
- `os.ReadFile(s.jsonFilePath)` → error nếu thất bại
- Unmarshal vào `map[string]interface{}` để trích xuất:
  - `succeeded` (bool, default false nếu thiếu)
  - `errors` ([]string, default `[]string{}` nếu nil)
  - `traceId` (string; nếu rỗng → generate bằng `fmt.Sprintf("trace-%d", time.Now().UnixNano())`)
  - `page`, `size`, `count` (float64 từ JSON → cast sang `int32`)
  - `data` (interface{} → marshal lại thành JSON string → gán vào `DataNguonDuLieu`)

Bước 2 — Build `model.KhoMoApiResponse`:
```go
payload := model.KhoMoApiResponse{
    ID:              nil,
    Succeeded:       succeeded,
    Errors:          errors,
    TraceId:         traceId,
    Page:            int32(page),
    Size:            int32(size),
    Count:           int32(count),
    DataNguonDuLieu: dataNguonDuLieu,
}
```

Bước 3 — Marshal payload → gọi ingest service:
- Marshal `payload` → `bodyBytes`
- Tạo request: `POST {ingestURL}/api/v1/kho-mo/receive`
- Header: `Content-Type: application/json`
- Gọi `s.httpClient.Do(req)` với ctx đã truyền vào
- `defer resp.Body.Close()`
- Đọc response body bằng `io.ReadAll`
- Nếu `resp.StatusCode != 200` → return error kèm body
- Parse response vào `KhoMoReceiveResponse` (xem File 1.3)

Bước 4 — Return `&KhoMoForwardResult{Message: "forwarded successfully", RecordsForwarded: 1}`

**Xử lý lỗi:** wrap tất cả bằng `fmt.Errorf("...: %w", err)`, message tiếng Việt.

---

### File 1.3 — `internal/model/kho_mo_forward.go` (TẠO MỚI)

Định nghĩa response struct nhận về từ ingest service (đặt ở model để service có thể dùng):
```go
// KhoMoReceiveResponse là response từ dmst-integration-ingest /api/v1/kho-mo/receive
type KhoMoReceiveResponse struct {
    Status          string `json:"status"`
    Message         string `json:"message"`
    RecordsPublished int   `json:"records_published"`
}
```

---

### File 1.4 — `internal/handler/kho-mo-ingest/handler.go` (TẠO MỚI)

Handler struct:
```go
type KhoMoIngestHandler struct {
    svc service.KhoMoForwardService
}

func NewKhoMoIngestHandler(svc service.KhoMoForwardService) *KhoMoIngestHandler
```

**Handler `Ingest` — `POST /api/v1/kho-mo/ingest`:**
- Tạo ctx với timeout 25s: `ctx, cancel := context.WithTimeout(c.Request.Context(), 25*time.Second)`
- `defer cancel()`
- Gọi `h.svc.FetchAndForward(ctx)`
- Log thành công: `logger.Info("Kho Mo data forwarded", zap.Int("records", result.RecordsForwarded))`
- Log thất bại: `logger.Error("Failed to forward Kho Mo data", zap.Error(err))`
- Response 200: `{"status":"ok", "records_forwarded": N, "message": "..."}`
- Response 500: `{"status":"error", "message": "<lỗi>"}`

---

### File 1.5 — `cmd/api/main.go` (chỉ THÊM)

Thêm đoạn 1 — sau `schemaSvc := schemaregistry.NewSchemaRegistryService(...)` (dòng 89):
```go
// Khởi tạo service fetch Kho Mở và forward sang ingest pipeline
khoMoForwardSvc := khomoforward.NewKhoMoForwardService(config.AppConfig)
```

Thêm đoạn 2 — sau `schemaHandler := schemaregistryhandler.NewSchemaHandler(schemaSvc)` (dòng 96):
```go
khoMoIngestHandler := khomoingest.NewKhoMoIngestHandler(khoMoForwardSvc)
```

Thêm đoạn 3 — trong block `api := r.Group("/api/v1")`, sau route schemas:
```go
// Kho Mở ingest — fetch mock data và forward sang dmst-integration-ingest
api.POST("/kho-mo/ingest", khoMoIngestHandler.Ingest)
```

---

### File 1.6 — `.env` của `adm-srv-go-api` (chỉ THÊM)

```env
# Ingest Service
INGEST_SERVICE_URL=http://160.191.32.193:8081
```

---

## PHẦN 2 — `dmst-integration-ingest`

### File 2.1 — `go.mod` (thêm dependency)

```bash
go get github.com/hamba/avro/v2@v2.27.0
```

**Lý do chọn `hamba/avro`:** Pure Go, không cần Confluent C library, hỗ trợ đầy đủ Avro spec,
có `avro.Parse()` để parse schema string và `avro.Unmarshal()` để validate data.

---

### File 2.2 — `internal/config/config.go` của ingest (chỉ THÊM)

Thêm vào struct `Config` (sau `ServiceName`):
```go
// Schema Registry
SchemaRegistryURL       string `mapstructure:"SCHEMA_REGISTRY_URL"`
SchemaRegistryUser      string `mapstructure:"SCHEMA_REGISTRY_USER"`
SchemaRegistryPassword  string `mapstructure:"SCHEMA_REGISTRY_PASSWORD"`
SchemaValidationEnabled bool   `mapstructure:"SCHEMA_VALIDATION_ENABLED"`
KhoMoSchemaSubject      string `mapstructure:"KHO_MO_SCHEMA_SUBJECT"`
KhoMoKafkaTopic         string `mapstructure:"KHO_MO_KAFKA_TOPIC"`
```

Thêm default vào `Load()`:
```go
viper.SetDefault("SCHEMA_REGISTRY_URL",       "http://localhost:8081")
viper.SetDefault("SCHEMA_VALIDATION_ENABLED", true)
viper.SetDefault("KHO_MO_SCHEMA_SUBJECT",     "rule-kho-mo-value")
viper.SetDefault("KHO_MO_KAFKA_TOPIC",        "dmst.kho-mo.raw")
```

Thêm vào `AppConfig = &Config{...}`:
```go
SchemaRegistryURL:       viper.GetString("SCHEMA_REGISTRY_URL"),
SchemaRegistryUser:      viper.GetString("SCHEMA_REGISTRY_USER"),
SchemaRegistryPassword:  viper.GetString("SCHEMA_REGISTRY_PASSWORD"),
SchemaValidationEnabled: viper.GetBool("SCHEMA_VALIDATION_ENABLED"),
KhoMoSchemaSubject:      viper.GetString("KHO_MO_SCHEMA_SUBJECT"),
KhoMoKafkaTopic:         viper.GetString("KHO_MO_KAFKA_TOPIC"),
```

---

### File 2.3 — `internal/service/schema_validator.go` (TẠO MỚI)

**Interface:**
```go
type SchemaValidatorService interface {
    // Validate kiểm tra JSON data có conform Avro schema đã đăng ký không.
    // subject: tên subject trên Registry, vd: "rule-kho-mo-value"
    // data: raw JSON bytes cần validate
    Validate(ctx context.Context, subject string, data []byte) error
}
```

**Struct:**
```go
type schemaValidatorSvc struct {
    registryURL string
    username    string
    password    string
    httpClient  *http.Client
    // schemaCache lưu Avro schema đã fetch từ Registry.
    // Key: subject (string), Value: avro.Schema
    // Dùng sync.Map vì pattern "write-once, read-many":
    //   - Mỗi subject chỉ fetch 1 lần khi chưa có trong cache
    //   - Sau đó hàng trăm goroutine đọc đồng thời mà không block nhau (lock-free read)
    schemaCache sync.Map
    log         *zap.Logger
}

func NewSchemaValidatorService(cfg *config.Config, log *zap.Logger) SchemaValidatorService {
    return &schemaValidatorSvc{
        registryURL: strings.TrimRight(cfg.SchemaRegistryURL, "/"),
        username:    cfg.SchemaRegistryUser,
        password:    cfg.SchemaRegistryPassword,
        httpClient:  &http.Client{Timeout: 10 * time.Second},
        log:         log,
    }
}
```

**Phương thức `Validate(ctx, subject, data)`:**

Bước 1 — Kiểm tra cache (lock-free):
```go
if cached, ok := s.schemaCache.Load(subject); ok {
    schema := cached.(avro.Schema)
    return s.validateAgainstSchema(schema, subject, data)
}
```

Bước 2 — Fetch schema từ Registry (nếu cache miss):
- Tạo request: `GET {registryURL}/subjects/{subject}/versions/latest`
- Header: `Accept: application/vnd.schemaregistry.v1+json`
- Set Basic Auth nếu `username != ""`
- Tạo request với ctx được truyền vào (KHÔNG dùng context.Background())
- `defer resp.Body.Close()`
- Xử lý 404 → return error: `"subject '%s' chưa được đăng ký trên Schema Registry"`
- Xử lý status != 200 → return error kèm body

Bước 3 — Parse response và compile schema:
```go
// Response từ Registry có dạng: {"subject":"...","version":1,"id":1,"schema":"{...avro json...}"}
var versionResp struct {
    Schema string `json:"schema"`
}
// Parse schemaStr bằng hamba/avro
schema, err := avro.Parse(versionResp.Schema)
if err != nil {
    return fmt.Errorf("không thể parse Avro schema của subject '%s': %w", subject, err)
}
// Lưu vào cache
s.schemaCache.Store(subject, schema)
```

Bước 4 — Validate (Marshal roundtrip):
```go
func (s *schemaValidatorSvc) validateAgainstSchema(schema avro.Schema, subject string, data []byte) error {
    // hamba/avro.Unmarshal nhận Avro binary, KHÔNG PHẢI JSON.
    // Chiến lược: JSON → Go struct → avro.Marshal để kiểm tra conform schema.
    // Nếu Marshal thành công → data hợp lệ với Avro schema.
    var payload map[string]interface{}
    if err := json.Unmarshal(data, &payload); err != nil {
        return fmt.Errorf("dữ liệu không phải JSON hợp lệ: %w", err)
    }
    if _, err := avro.Marshal(schema, payload); err != nil {
        return fmt.Errorf("dữ liệu không hợp lệ với Avro schema '%s': %w", subject, err)
    }
    return nil
}
```

---

### File 2.4 — `internal/service/kho_mo_service.go` (TẠO MỚI)

**Interface:**
```go
type KhoMoService interface {
    // Process nhận JSON payload từ adm-srv-go-api,
    // validate schema, rồi publish lên Kafka topic riêng cho Kho Mở.
    Process(ctx context.Context, payload []byte) (*KhoMoProcessResult, error)
}

type KhoMoProcessResult struct {
    Status          string `json:"status"`
    Message         string `json:"message"`
    RecordsPublished int   `json:"records_published"`
}
```

**Struct và constructor:**
```go
type khoMoSvc struct {
    validator   SchemaValidatorService
    kafkaWriter *kafka.Writer
    kafkaTopic  string
    subject     string          // Schema Registry subject để validate
    log         *zap.Logger
    // validationEnabled là feature flag — nếu false bỏ qua bước validate
    validationEnabled bool
}

func NewKhoMoService(
    validator SchemaValidatorService,
    kafkaWriter *kafka.Writer,
    kafkaTopic string,
    subject string,
    validationEnabled bool,
    log *zap.Logger,
) KhoMoService
```

**Phương thức `Process(ctx, payload)`:**

Bước 1 — Validate schema (nếu enabled):
```go
if s.validationEnabled && s.validator != nil {
    if err := s.validator.Validate(ctx, s.subject, payload); err != nil {
        s.log.Error("Schema validation failed",
            zap.String("subject", s.subject),
            zap.Error(err),
        )
        return nil, fmt.Errorf("schema validation thất bại: %w", err)
    }
    s.log.Info("Schema validation passed", zap.String("subject", s.subject))
}
```

Bước 2 — Publish lên Kafka:
```go
msg := kafka.Message{
    Topic: s.kafkaTopic,
    Value: payload,
}
if err := s.kafkaWriter.WriteMessages(ctx, msg); err != nil {
    return nil, fmt.Errorf("không thể publish lên Kafka topic '%s': %w", s.kafkaTopic, err)
}
```

Bước 3 — Return result:
```go
return &KhoMoProcessResult{
    Status:          "ok",
    Message:         "published successfully",
    RecordsPublished: 1,
}, nil
```

---

### File 2.5 — `internal/handler/kho_mo_handler.go` (TẠO MỚI)

```go
type KhoMoHandler struct {
    svc service.KhoMoService
    log *zap.Logger
}

func NewKhoMoHandler(svc service.KhoMoService, log *zap.Logger) *KhoMoHandler
```

**Handler `Receive` — `POST /api/v1/kho-mo/receive`:**
- Đọc body bằng `io.ReadAll(c.Request.Body)`
- Validate: body không được rỗng → 400 `{"error": "request body is required"}`
- Validate: body phải là JSON hợp lệ (`json.Valid(body)`) → 400 `{"error": "invalid JSON body"}`
- Gọi `h.svc.Process(c.Request.Context(), body)`
- Log thất bại: `h.log.Error("Failed to process kho-mo payload", zap.Error(err))`
- Response 200: `KhoMoProcessResult` (marshal từ result)
- Response 422 nếu lỗi schema validation (detect bằng `strings.Contains(err.Error(), "schema validation")`): `{"error": "...", "code": "SCHEMA_VALIDATION_FAILED"}`
- Response 500 cho lỗi khác: `{"error": "..."}`

---

### File 2.6 — `cmd/ingest/main.go` (chỉ THÊM)

Thêm đoạn 1 — sau `kafkaWriter := ...`:
```go
// Khởi tạo schema validator cho Kho Mở pipeline.
// Dùng feature flag SCHEMA_VALIDATION_ENABLED để dễ disable khi debug.
var schemaValidator service.SchemaValidatorService
if cfg.SchemaValidationEnabled {
    schemaValidator = service.NewSchemaValidatorService(cfg, log_)
    log_.Info("Kho Mo schema validation enabled",
        zap.String("registry", cfg.SchemaRegistryURL),
        zap.String("subject", cfg.KhoMoSchemaSubject),
    )
} else {
    log_.Warn("Kho Mo schema validation DISABLED")
}

// Khởi tạo KhoMoService — stack xử lý riêng, độc lập với ingestSvc
khoMoSvc := service.NewKhoMoService(
    schemaValidator,
    kafkaWriter,
    cfg.KhoMoKafkaTopic,
    cfg.KhoMoSchemaSubject,
    cfg.SchemaValidationEnabled,
    log_,
)
```

Thêm đoạn 2 — sau `jobHandler := ...`:
```go
khoMoHandler := handler.NewKhoMoHandler(khoMoSvc, log_)
```

Thêm đoạn 3 — trong block `api := r.Group("/api/v1")`:
```go
// Kho Mở ingest — nhận data từ adm-srv-go-api, validate schema, publish Kafka
api.POST("/kho-mo/receive", khoMoHandler.Receive)
```

---

### File 2.7 — `.env` của `dmst-integration-ingest` (chỉ THÊM)

```env
# Schema Registry — Kho Mo validation
SCHEMA_REGISTRY_URL=http://160.191.32.193:8081
SCHEMA_REGISTRY_USER=
SCHEMA_REGISTRY_PASSWORD=
SCHEMA_VALIDATION_ENABLED=true
KHO_MO_SCHEMA_SUBJECT=rule-kho-mo-value
KHO_MO_KAFKA_TOPIC=dmst.kho-mo.raw
```

---

## API Contract

### Project A — Endpoint trigger

```
POST http://160.191.32.193:8080/api/v1/kho-mo/ingest
```
Không cần body. Service đọc file nội bộ và tự forward.

**Response 200:**
```json
{
  "status": "ok",
  "records_forwarded": 1,
  "message": "forwarded successfully"
}
```

---

### Project B — Endpoint nhận data (MỚI)

```
POST http://160.191.32.193:8081/api/v1/kho-mo/receive
Content-Type: application/json

{
  "succeeded": true,
  "errors": [],
  "traceId": "trace-1713700000",
  "page": 1,
  "size": 10,
  "count": 5,
  "dataNguonDuLieu": "{\"items\":[...]}"
}
```

**Response 200 (valid):**
```json
{
  "status": "ok",
  "message": "published successfully",
  "records_published": 1
}
```

**Response 422 (schema không hợp lệ):**
```json
{
  "error": "schema validation thất bại: dữ liệu không hợp lệ với Avro schema 'rule-kho-mo-value': ...",
  "code": "SCHEMA_VALIDATION_FAILED"
}
```

---

## Constraints bắt buộc

| # | Ràng buộc |
|---|---|
| 1 | `go build ./...` không lỗi ở cả 2 project |
| 2 | Flow `/push/:datasourceID` cũ của ingest KHÔNG được sửa |
| 3 | `KhoMoService` và `SchemaValidatorService` là stack hoàn toàn độc lập với `IngestService`/`JobService` |
| 4 | Logger trong ingest là `*zap.Logger` instance — inject qua constructor, KHÔNG dùng global |
| 5 | `SchemaValidatorService` inject vào `KhoMoService` qua interface — dễ mock khi test |
| 6 | `SCHEMA_VALIDATION_ENABLED=false` → bypass validate hoàn toàn, vẫn publish Kafka |
| 7 | `sync.Map` cache schema trong validator — comment tiếng Việt giải thích lock-free read |
| 8 | KHÔNG dùng `context.Background()` trong validator — nhận ctx từ tham số |
| 9 | `defer resp.Body.Close()` bắt buộc sau mọi HTTP response |
| 10 | Import path đúng module: `"adm-srv-go-api/..."` và `"dmst-integration-ingest/..."` |
| 11 | Mọi comment viết **tiếng Việt**, giải thích "tại sao" |

---

## Output yêu cầu (theo thứ tự)

```
=== adm-srv-go-api (Project A) ===
1. Diff internal/config/config.go                    (chỉ phần thêm)
2. internal/model/kho_mo_forward.go                  (file mới)
3. internal/service/kho-mo-forward/service.go         (file mới)
4. internal/handler/kho-mo-ingest/handler.go          (file mới)
5. Diff cmd/api/main.go                              (chỉ phần thêm)
6. .env additions

=== dmst-integration-ingest (Project B) ===
7. Diff go.mod                                       (thêm hamba/avro)
8. Diff internal/config/config.go                    (chỉ phần thêm)
9. internal/service/schema_validator.go               (file mới)
10. internal/service/kho_mo_service.go                (file mới)
11. internal/handler/kho_mo_handler.go                (file mới)
12. Diff cmd/ingest/main.go                           (chỉ phần thêm)
13. .env additions
```
