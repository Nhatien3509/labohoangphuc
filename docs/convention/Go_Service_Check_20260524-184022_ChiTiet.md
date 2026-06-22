# BÁO CÁO SCAN CONVENTION — CHI TIẾT

**Mã báo cáo:** SCAN-20260524-184022
**Thời gian quét:** 2026-05-24 18:40:22
**Tổng hợp:** [Go_Service_Check_20260524-184022_TongHop.md](./Go_Service_Check_20260524-184022_TongHop.md)

---

## Section 2: Nguyên tắc kiến trúc — FAIL (1)

### Fat Handler vi phạm

| File | Line | Vấn đề | Khuyến nghị |
|---|---|---|---|
| `admin-service/internal/handler/kho-mo-sync/handler.go` | 92 | `TriggerSync()` chứa business logic: sync orchestration, parameter override, HTTP forwarding | Chuyển logic vào service layer, handler chỉ parse request + gọi service |

---

## Section 4: Naming Convention — FAIL (~650)

### 4.3 File name không snake_case — 2 violations

| File | Vấn đề | Khuyến nghị |
|---|---|---|
| `admin-service/internal/model/data-sharing-config/data-sharing-config-version.go` | kebab-case | `data_sharing_config_version.go` |
| `admin-service/internal/service/quan-ly-nguoi-dung/sync-history.go` | kebab-case | `sync_history.go` |

### 4.6 Module name — 3 violations

| Service | Hiện tại | Đề xuất |
|---|---|---|
| `integration-service` | `dmst-integration-ingest` | `ttst/integration-service` |
| `admin-service` | `adm-srv-go-api` | `ttst/admin-service` |
| `file-downloader-service` | `dmst-file-downloader` | `ttst/file-downloader-service` |

### 4.7 JSON tag PascalCase — 641 violations

#### Shared struct DB+API (quan trọng nhất) — 69 violations

Struct dùng chung cho cả GORM (DB) và JSON (API response). DB column `snake_case` OK, nhưng `json` tag phải `PascalCase`.

**`integration-service` — 40:**

| File | Struct | Violations | Mẫu vi phạm | Sửa |
|---|---|---|---|---|
| `model/datasource.go` | `Datasource` | 8 | `json:"api_host"` | `json:"ApiHost"` |
| `model/job.go` | `Job` | 4 | `json:"datasource_id"` | `json:"DatasourceId"` |
| `model/data_type.go` | `DataType` | 6 | `json:"kafka_topic"` | `json:"KafkaTopic"` |
| `model/pull_history.go` | `PullHistory` | 11 | `json:"last_success_page"` | `json:"LastSuccessPage"` |
| `model/pull_errors.go` | `PullError` | 7 | `json:"error_msg"` | `json:"ErrorMsg"` |
| `model/job_run_log.go` | `JobRunLog` | 4 | `json:"errors"` | `json:"Errors"` |

**`admin-service` — 29:**

| File | Struct | Violations | Mẫu vi phạm | Sửa |
|---|---|---|---|---|
| `model/admin_system_log.go` | `AdminSystemLog` | 7 | `json:"actor_id"` | `json:"ActorId"` |
| `model/data_source.go` | `DataSourceMetadata` | 22 | `json:"kafkaTopicPattern"` | `json:"KafkaTopicPattern"` |

**Cách fix:**

```go
// TRƯỚC
type Job struct {
    DatasourceID string    `gorm:"not null;index" json:"datasource_id"`
    CreatedAt    time.Time `json:"created_at"`
}

// SAU — gorm giữ nguyên, json đổi PascalCase
type Job struct {
    DatasourceID string    `gorm:"not null;index" json:"DatasourceId"`
    CreatedAt    time.Time `json:"CreatedAt"`
}
```

#### DTO/Response-only — 11 violations

| File | Struct | Violations |
|---|---|---|
| `integration-service/model/sync_request.go` | `SyncRequest` | 11 (vd: `json:"ma_cau_hinh"` → `json:"MaCauHinh"`) |

#### External API mapping — ~499 (giữ nguyên)

Struct nhận từ external API (Kho DL Mẹ, SigNoz, Flink, Kong) — giữ nguyên `json` tags theo API nguồn.

#### Kafka message structs — 33 (coordinate)

`file-downloader-service`: `fileDownloadRequest` (12), `fileDownloadResult` (14), `dlqMessage` (7). Cần coordinate Flink consumer trước khi đổi.

> `admin-service` DTOs mới đã đúng PascalCase 100% (`Permission`, `ConnectedSystem`, `JobKeyValueRequest`, `Endpoint`, ...)

---

## Section 7: Clean Code Rules — FAIL (49)

### Functions > 50 dòng — 44

**`integration-service` — 11:**

| File | Function | Dòng |
|---|---|---|
| `cmd/server/main.go` | `main()` | 176 |
| `core/pipeline/sync_engine.go` | `Run()` | 93 |
| `service/schema_validator.go` | `Validate()` | 79 |
| `core/pipeline/sync_engine.go` | `processPage()` | 79 |
| `handler/sync_handler.go` | `Run()` | 72 |
| `core/pipeline/delta_filter.go` | `ProcessBatch()` | 70 |
| `provider/cdlqg/client.go` | `FetchPage()` | 67 |
| `provider/cdlqg/client.go` | `FetchDetailRaw()` | 67 |
| `service/ingest_service.go` | `Run()` | 57 |
| `validator/rules/format.go` | `Validate()` | 55 |
| `config/config.go` | `Load()` | 53 |

**`admin-service` — top 10 (tổng 33):**

| File | Function | Dòng |
|---|---|---|
| `cmd/server/main.go` | `main()` | 435 |
| `service/quan-tri-phan-mem/connected_system_service.go` | `Update()` | 122 |
| `service/signoz/service.go` | `QueryLogs()` | 117 |
| `service/schema-registry/service.go` | `parseXLSX()` | 113 |
| `service/schema-wrapper/service.go` | `Update()` | 111 |
| `service/route_config_svc.go` | `createRouteConfig()` | 105 |
| `service/kafka_manager.go` | `EnsureTopicExists()` | 104 |
| `service/signoz_service.go` | `QueryLogs()` | 99 |
| `config/config.go` | `LoadConfig()` | 92 |
| `repository/rbac_repo.go` | `SeedCatalog()` | 89 |

**`file-downloader-service` — 0 (max 33 dòng)**

### `context.Background()` business logic — 5

| Service | File | Line | Khuyến nghị |
|---|---|---|---|
| integration | `handler/sync_handler.go` | 101 | `c.Request.Context()` |
| integration | `service/job_service.go` | 79 | Truyền `ctx` từ caller |
| integration | `core/pipeline/sync_engine.go` | 140, 148, 312 | `context.WithoutCancel(ctx)` |

---

## Section 8: Error Handling — FAIL (110)

### Bare `return err` — 110

**`integration-service` — 14:**

| File | Lines |
|---|---|
| `service/ingest_service.go` | 57, 71, 84, 116, 130 |
| `service/datasource_service.go` | 44 |
| `service/schema_validator.go` | 152, 161, 230 |
| `provider/cdlqg/client.go` | 88, 159 |
| `core/pipeline/sync_engine.go` | 109, 142 |
| `core/pipeline/delta_filter.go` | 142 |

**`admin-service` — 95 (top 5):**

| File | Số lượng | Lines |
|---|---|---|
| `repository/rbac_repo.go` | 14 | 116, 121, 133, 138, 178... |
| `service/quan-ly-ma-loi/error_code_service.go` | 13 | 75, 152, 156, 161... |
| `service/data-sharing-config/service.go` | 11 | 88, 94, 100, 110... |
| `service/vault_service.go` | 6 | 57, 70, 83, 96, 124, 141 |
| `service/job/job_service.go` | 6 | 137, 172, 245, 251, 266, 274 |

---

## Section 10: HTTP API Convention — FAIL (185)

### `gin.H{}` trực tiếp — 185

`integration-service` — 42, `admin-service` — 143

**Top 5 files (admin):**

| File | Số lượng |
|---|---|
| `handler/route_config_handler.go` | 23 |
| `handler/kafka_handler.go` | 18 |
| `handler/schema-registry/handler.go` | 17 |
| `handler/flink_handler.go` | 16 |
| `handler/nguoi_dan_handler.go` | 13 |

**Khuyến nghị:** Implement `pkg/httputil/response.go` rồi replace toàn bộ `gin.H{}`.

---

## Section 12: Database Convention — FAIL

### Thiếu mandatory columns

| Column | datasource | job | pull_history | pull_errors | data_type | job_run_log |
|---|---|---|---|---|---|---|
| `created_at` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `updated_at` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `deleted_at` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `version` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `created_by` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `updated_by` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> Column naming (`snake_case`) nhất quán — **PASS**.

---

## Section 13: Security — FAIL (1)

| File | Line | Vấn đề | Khuyến nghị |
|---|---|---|---|
| `integration-service/internal/config/config.go` | 55 | `viper.SetDefault("DB_PASS", "secret")` | Bỏ default, yêu cầu env var bắt buộc hoặc dùng Vault |

---

## Section 17: Observability — FAIL

| Service | `/health` | `/ready` |
|---|---|---|
| `integration-service` | ✅ | ❌ |
| `admin-service` | ✅ | ❌ |
| `file-downloader-service` | N/A (worker) | N/A |
| 4 stubs | ❌ | ❌ |

---

## Section 18: Testing — FAIL

| Service | Test files | Go files | Coverage |
|---|---|---|---|
| `integration-service` | 0 | ~50 | 0% |
| `admin-service` | 1 | ~150 | ~1% |
| `file-downloader-service` | 0 | ~7 | 0% |
| 4 stubs | 0 | ~8 | 0% |
| **Tổng** | **1** | **~215** | **<1%** |

---

## Section 20: Docker — FAIL (14)

Tất cả 7 Dockerfiles thiếu:

| Thiếu | Khuyến nghị |
|---|---|
| `USER` directive | `RUN addgroup -S app && adduser -S app -G app` + `USER app` |
| `HEALTHCHECK` directive | `HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health \|\| exit 1` |

---

## Section 25: Graceful Shutdown — FAIL (6 svc)

| Service | Signal handling | HTTP shutdown | Resource close | Kết quả |
|---|---|---|---|---|
| `integration-service` | ❌ | `r.Run()` | defer close | **FAIL** |
| `admin-service` | ❌ | `r.Run()` | defer close | **FAIL** |
| `file-downloader-service` | ✅ SIGINT/SIGTERM cancel ctx | `Shutdown()` | ✅ | **PASS** |
| 4 stubs | ❌ | — | — | **FAIL** |

**Khuyến nghị cho `integration` / `admin`:**

```go
srv := &http.Server{Addr: ":" + port, Handler: router}
go func() { srv.ListenAndServe() }()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
srv.Shutdown(ctx)
```

---

## Section 27: Enterprise Rules — FAIL

| Tiêu chí | Trạng thái | Vấn đề |
|---|---|---|
| Audit logging | Có nhưng hạn chế | `JobRunLog` có `TraceId`, nhưng chỉ dùng trong legacy ingest |
| Request traceability | Thiếu | `TraceId` thủ công, `sync-page-N` thiếu middleware extract `X-Trace-ID` |
| OTel spans | Initialized nhưng không dùng | `tracer.Init()` gọi nhưng không tạo span trong handler/service |

**Khuyến nghị:** Thêm middleware inject `traceId` + `requestId` vào context (xem Convention Section 9.2).

---

## Section 30: Definition of Done — FAIL (3)

| Tiêu chí | Trạng thái |
|---|---|
| SonarQube | ❌ Chưa tích hợp |
| Trivy scan | ❌ Chưa tích hợp |
| Swagger | ⚠️ Chỉ `admin-service` có. `integration-service` thiếu |

---

## DB COLUMN NAMING — PASS

Tất cả service nhất quán `snake_case`. GORM tự mapping. Không vi phạm.

> **Quan trọng:** DB column `snake_case` OK, nhưng `json` tag trên cùng struct phải `PascalCase` cho API response (xem Section 4.7 / V-01a).

---

## Kết luận

Deep scan 31 sections cho thấy **16 sections PASS (52%)**, **9 FAIL nhẹ/vừa (29%)**, **5 FAIL nghiêm trọng (16%)**.

**Ưu tiên P0:** Graceful shutdown (thấp effort) + unit test (cao impact). `file-downloader-service` là mẫu tốt nhất — PASS gần hết sections.
