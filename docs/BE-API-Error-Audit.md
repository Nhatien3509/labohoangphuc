# Rà soát API backend trả lỗi không tường minh

> Ngày rà soát: 2026-06-20
> Phạm vi: toàn bộ HTTP handler của các service Go trong `src/services/*`
> Mục tiêu: liệt kê các API **không trả về lỗi tường minh** để chuẩn hoá theo `bizerr`.

## 1. Chuẩn lỗi tường minh (tham chiếu)

Chuẩn của project nằm ở `admin-service`: `src/services/admin-service/internal/utils/bizerr.go`.

Helper `bizerr.Write(c, bizerr.ErrXxx.WithDescription(...))` trả JSON:

```json
{
  "error_code": 13,
  "message": { "vi": "Tham số bị thiếu hoặc không hợp lệ", "en": "Params are missing or invalid" },
  "description": "chi tiết tuỳ chọn"
}
```

HTTP status được map từ `error_code` (13→400, 14→401, 16→403, 17→409, 15/99→500). Có sẵn `bizerr.MapServiceOrRepoError(err)` để map lỗi service/repo → BizError và **che chi tiết kỹ thuật**.

## 2. Định nghĩa "không tường minh"

Một endpoint bị tính là **không tường minh** nếu rơi vào một trong các trường hợp:

| Mã | Kiểu lỗi | Vì sao có vấn đề |
|----|----------|------------------|
| A | Lộ `err.Error()` thô ra client (`c.JSON(500, gin.H{"error": err.Error()})`) | Lộ chi tiết nội bộ (DB/driver), message tiếng Anh kỹ thuật, không dịch |
| B | Shape JSON khác chuẩn (`{"error": ...}`, `{"status":"error"}`, thiếu `error_code`) | FE không parse thống nhất, không có mã lỗi nghiệp vụ |
| C | Nuốt lỗi (`_ = err`, bỏ qua, chỉ log rồi trả 200/empty) | Người dùng/FE không biết đã lỗi |
| D | Message generic vô nghĩa hoặc tiếng Anh cho user cuối | Không hành động được |
| E | Đúng shape bizerr nhưng nhét `err.Error()` kỹ thuật vào `description` | Shape ổn nhưng nội dung chưa tường minh/chưa dịch |

## 3. Tổng quan kết quả

| Service | Loại | Trạng thái | Ghi chú |
|---------|------|-----------|---------|
| admin-service | HTTP API | ⚠️ Một phần | ~13 file cấp cao toàn bộ lệch chuẩn; subfolder phần lớn ĐẠT, vài file lỗi nặng |
| integration-service | HTTP API | ❌ Gần như toàn bộ | 18/19 endpoint lệch chuẩn |
| sharing-service | HTTP API | ❌ | `share_handler`, `summary_handler` lệch chuẩn |
| audit-service | HTTP API | ❌ | `access_log_handler`, `signoz_handler` lệch chuẩn |
| mock_datasource | HTTP API | ❌ | Dùng DTO riêng `APIResponse{Errors[]}`, lộ `err.Error()` |
| monitoring-service | Skeleton | — | Chưa có HTTP server/handler |
| masking-service | Skeleton | — | Chưa có HTTP server/handler |
| file-downloader-service | Kafka worker | — | Không có HTTP API public |

> **Lưu ý:** Chỉ `admin-service` định nghĩa `bizerr`; các service khác chưa import/dùng. Không có middleware lỗi toàn cục — mỗi handler tự trả response.

---

## 4. admin-service

### 4.1 Handler cấp cao — toàn bộ LỆCH CHUẨN (kiểu A/B)

Tất cả dùng `gin.H{"error": err.Error()}` hoặc `gin.H{"error": "<generic en>"}`, không có `error_code`/`message{vi,en}`.

| File | Handler (đại diện) | Kiểu | Mức |
|------|--------------------|------|-----|
| `admin_system_log_handler.go:62,80` | Search | A/B | Cao |
| `audit_log_handler.go:29` | GetAll | A/B | Cao |
| `dashboard_handler.go:67,92…404` | GetSummary, GetTrend7Days (8 case), + ~13 handler dashboard | B/D (generic en) | TB |
| `data_source_handler.go:25,32,90,97,111` | Create/Update/Delete | A/B | Cao |
| `data_source_handler.go:44` | ListDataSources | D (generic) | Thấp |
| `flink_handler.go:135,144,273,342,362` | UploadJar, SubmitJob, Cancel* | A/B | Cao |
| `flink_handler.go:105,176,221,307` | UploadJar(no file), ListJobs, GetJob, GetJobExecutions | D (generic) | Thấp |
| `kafka_handler.go:41,64,83,99,130,154,194,216,233,262,278,287` | **Toàn bộ 12 handler** (CreateTopic…GetClusterHealth) | A/B | Cao |
| `kong_auth_handler.go:39,73,106` | CreateConsumer, CreateConsumerKey, AddPluginToRoute | A/B | Cao |
| `nguoi_dan_handler.go:34,54,67,93,112,133,147` | **Toàn bộ 7 handler** (Create…GetAllEncrypt) | A/B | Cao |
| `partner_route_handler.go:48` | Create | A/B | Cao |
| `route_config_handler.go:114,143,183,223,285` | List/Get/Update/Delete/History | A/B | Cao |
| `route_handler.go:26` | GetAllRoutes | A/B | Cao |
| `vault_handler.go:45,78` | Encrypt, Decrypt | A/B | Cao |
| `sso/sso_handler.go:33,59,86` | Login, Refresh, Logout (401 + err thô) | A/B | Cao |

→ ~61 endpoint, trong đó ~47 mức **Cao** (lộ `err.Error()`), phần còn lại generic message.

### 4.2 Handler subfolder

**Đạt chuẩn (dùng bizerr đầy đủ):**
- `data-sharing-config/handler.go` (8 handler)
- `job/handler.go` (12 handler)
- `phan-quyen/handler.go` (12 handler)
- `quan-ly-ma-loi/handler.go` (10) + `quan-ly-ma-loi/excel_handler.go` (4)
- `quan-tri-phan-mem/handler.go` (11)
- `schema-wrapper/handler.go` (9)
- `quan-ly-nguoi-dung/handler.go` — phần lớn ĐẠT (trừ mục dưới)

**Lỗi cần xử lý:**

| File:line | Handler | Kiểu | Mức |
|-----------|---------|------|-----|
| `danh-muc/handler.go` (~12 handler: Create, GetList, Update, Delete, *Data…) | dùng `ErrInvalidParams.WithDescription(err.Error())` | E (shape đúng, description thô) | TB |
| `danh-muc/handler.go:521-588` | ImportCategoryData | A/B (`gin.H{"message": err.Error()}`) | Cao |
| `schema-registry/handler.go:366,479,492,511,539` | RegisterSchema, GetLatestSchema, CheckHealth, DeleteSchema, GetAvroSchema | A/B (`gin.H{"Error": err.Error()}`) | Cao |
| `quan-ly-nguoi-dung/handler.go:89-94` | **SyncAuto** — tạo BizError nhưng **không gọi `bizerr.Write`**, trả về im lặng | C (nuốt lỗi) | Cao |
| `quan-ly-nguoi-dung/handler.go:245-257` | parseSyncManualUserID (helper) | A/B | TB |
| `kho-mo-sync/handler.go:76-105` | Sync — lộ err thô + `_ = json.Unmarshal(...)` | A/B + C | Cao |
| `ttdl/handler.go:93-125` | CreateJobThuThapDuLieu — lộ err thô + `_ = json.Unmarshal(...)` | A/B + C | Cao |

---

## 5. integration-service — 18/19 endpoint LỆCH CHUẨN

Tất cả dùng `gin.H{"error": ...}`, không có `error_code`/`message{vi,en}`; chưa có `bizerr` riêng.

| File:line | Handler | Method+Route | Kiểu | Mức |
|-----------|---------|--------------|------|-----|
| `datasource_handler.go:32` | GetAll | GET /api/v1/datasources | A/B | Cao |
| `datasource_handler.go:42` | GetByID | GET /datasources/:id | B/D ("invalid id") | TB |
| `datasource_handler.go:55,59` | Create | POST /datasources | A/B | Cao |
| `datasource_handler.go:73,77` | Update | PUT /datasources/:id | A/B | Cao |
| `datasource_handler.go:90` | Delete | DELETE /datasources/:id | A/B | Cao |
| `job_handler.go:28` | Trigger | POST /jobs/trigger/:dsID | A/B | Cao |
| `job_handler.go:42` | GetStatus | GET /jobs/:id | B/D ("job not found") | TB |
| `job_handler.go:61` | Push | POST /push/:dsID | A/B | Cao |
| `job_handler.go:75` | ListHistory | GET /jobs/history/:dsID | A/B | Cao |
| `redis_handler.go:28` | CheckHealth | GET /health/redis | A/B (`{"status":"error"}`) | Cao |
| `redis_handler.go:39,59,73,93` | ListKeys, MGetVersions, DeleteKey, DeleteKeysByPrefix | A/B | Cao |
| `schema_handler.go:30,36` | InvalidateSchemaCache | DELETE /schemas/cache/:subject | B/D (en message) | TB |
| `sync_handler.go:87` | Run | POST /pull-jobs/:nguon/run | A/B (mix vi/en) | Cao |
| `sync_handler.go:142,153` | GetPullHistory, GetPullErrors | GET /pull-jobs/:nguon/* | A/B | Cao |

`health.go:HealthCheck` — không có nhánh lỗi (OK).

---

## 6. sharing-service

| File:line | Handler | Method+Route | Kiểu | Mức |
|-----------|---------|--------------|------|-----|
| `share_handler.go:175-178` | `fail()` helper → `gin.H{"error": p.errorMessage}` | (dùng chung) | B | Cao |
| `share_handler.go:67-173` | Share — `fail(..., "body không hợp lệ: "+err.Error())`, `"list failed: "+err.Error()` | POST /api/sharing/share | A/B | Cao |
| `summary_handler.go:76` | GetLatestFlows | GET /summary/latest-flows | A/B | Cao |
| `summary_handler.go:106` | GetFlowRanking | GET /summary/flow-ranking | A/B | Cao |
| `summary_handler.go:137,143` | GetSummary | GET /summary | A/B | Cao |

`health.go` — OK.

---

## 7. audit-service

| File:line | Handler | Method+Route | Kiểu | Mức |
|-----------|---------|--------------|------|-----|
| `access_log_handler.go:36,51` | Query | POST /api/v1/logs/access | A/B | Cao |
| `signoz_handler.go:52,73` | QueryLogs | POST /api/v1/logs/query | A/B | Cao |
| `signoz_handler.go:103,129` | QueryLogsByTraceID | GET /api/v1/logs/trace/{id} | A/B/D ("trace_id is required") | Cao |
| `signoz_handler.go:173` | QueryTraces | GET /api/v1/traces | A/B | Cao |

---

## 8. mock_datasource

Dùng DTO riêng `APIResponse{Succeeded, Errors[]string, TraceId, Data}` (`internal/dto/response.go`) + `dto.Fail(traceId, msg)` — khác hẳn chuẩn `bizerr`, và nhồi `err.Error()` thô vào `Errors[]`.

| File:line | Handler | Method+Route | Kiểu | Mức |
|-----------|---------|--------------|------|-----|
| `gen_handler.go:28-41` | GenSchema | POST /api/v1/gen/schema/{ma_loai} | C + trả `result.Error` thô | Cao |
| `gen_handler.go:50-61` | GenAll | POST /api/v1/gen/all | B (shape không chuẩn) | Cao |
| `record_handler.go:44` | Search | GET /api/v1/records | A/B (`dto.Fail(traceId, err.Error())`) | Cao |
| `record_handler.go:57-64` | ListSchemas | GET /api/v1/schemas | A/B (`gin.H{"error": err.Error()}`) | Cao |
| `search_handler.go:68` | TimKiemDuLieu | GET /api/v1/du-lieu-mo/tim-kiem | A/B (`dto.Fail(..., err.Error())`) | Cao |

---

## 9. Service không cần audit HTTP

- **monitoring-service**, **masking-service**: hiện là skeleton, `main.go` chỉ load config + log, chưa khởi động HTTP server → không có handler.
- **file-downloader-service**: Kafka consumer/worker thuần (`cmd/api/main.go` chạy `w.Run(ctx)`), không expose HTTP API.

---

## 10. Khuyến nghị

1. **Tách `bizerr` thành package dùng chung** (`src/pkg`) để mọi service import được, thay vì chỉ nằm trong admin-service.
2. **Thêm middleware lỗi toàn cục** (gin recovery + error writer) chuẩn hoá shape `{error_code, message{vi,en}, description}` cho mọi service.
3. **Ưu tiên xử lý mức Cao trước** (lộ `err.Error()` thô): integration-service (toàn bộ), admin-service cấp cao (kafka/nguoi_dan/route/vault/sso…), sharing/audit/mock_datasource.
4. **Thay `WithDescription(err.Error())`** (mức E ở `danh-muc`) bằng message nghiệp vụ đã dịch; chỉ đưa `err.Error()` vào log, không trả ra client.
5. **Sửa nuốt lỗi** (mức C): `quan-ly-nguoi-dung.SyncAuto`, các `_ = json.Unmarshal(...)` ở `kho-mo-sync` và `ttdl`.
6. **mock_datasource**: cân nhắc thống nhất về `bizerr` hoặc ít nhất map `Errors[]` sang message nghiệp vụ, không trả `err.Error()` thô.

### Thống kê nhanh
- Endpoint lệch chuẩn: **~95** (admin ~61 + integration 18 + sharing 5 + audit 4 + mock 5 + danh-muc ~12 nhóm E…).
- Mức **Cao** (lộ `err.Error()`/nuốt lỗi): phần lớn.
- File **đạt chuẩn**: 7 file subfolder của admin-service (data-sharing-config, job, phan-quyen, quan-ly-ma-loi, excel, quan-tri-phan-mem, schema-wrapper).

> Số dòng mang tính chỉ dẫn (tại thời điểm rà soát); nên `grep "gin.H{\"error\""` và `grep "err.Error()"` trong `src/services` để lấy danh sách cập nhật trước khi sửa.
