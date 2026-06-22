# Phân tích `admin-service/cmd/server/main.go`

- **File**: `src/services/admin-service/cmd/server/main.go`
- **LOC**: 267
- **Ngày phân tích**: 2026-05-12
- **Tham chiếu chuẩn**: `docs/code-standards.md`, `src/services/integration-service/CLAUDE.md`, ai-standards backend rules.

---

## 1. Tổng quan vai trò

`main.go` là entrypoint của `admin-service` (`adm-srv-go-api`). Trách nhiệm hiện tại:

1. Load config (`viper` + `godotenv`).
2. Init logger (`zap`).
3. Mở kết nối PostgreSQL qua GORM + `AutoMigrate` 18 model.
4. Khởi tạo 9 repository, ~12 service, ~10 handler theo Clean Architecture.
5. Wire Kong integration (RouteConfig + Auth).
6. Spawn Flink status poller goroutine.
7. Đăng ký routes Gin (`/api/v1/*`).
8. Khởi tạo Cron scheduler cho Kho Mở sync trigger.
9. Start Gin HTTP server.

---

## 2. Đánh giá convention

### 2.1. Phù hợp

| Tiêu chí | Trạng thái | Ghi chú |
|---|---|---|
| Cấu trúc `cmd/`, `internal/{config,handler,service,repository,model}`, `pkg/` | OK | Đúng pattern trong `docs/code-standards.md`. |
| Loading config qua package tập trung (`config.LoadConfig`) | OK | Có `viper.SetDefault` đầy đủ, dễ override bằng env. |
| Mở healthcheck `GET /health` | OK | Đáp ứng yêu cầu observability. |
| Phân chia route theo domain (`kafka`, `connected-systems`, `schemas`, `routes`, `kho-mo`, …) | OK | Naming bám domain nghiệp vụ. |
| Dùng middleware có chọn lọc (`AdminSystemLogMiddleware` chỉ cho connected-systems) | OK | Tránh áp middleware nặng lên toàn bộ API. |

### 2.2. Vi phạm / không nhất quán

**(C1) File quá dài so với chuẩn nội bộ**
- `docs/code-standards.md` quy định: *"ưu tiên giữ file code dưới ~200 LOC khi thực tế cho phép"*.
- File hiện tại 267 LOC, chứa đồng thời: wiring DI, route registration, cron init, poller bootstrap. Mỗi việc thuộc một concern khác nhau.
- → Đề xuất tách: `cmd/server/wire.go` (init repo/service/handler), `cmd/server/routes.go` (đăng ký router), `cmd/server/cron.go` (cron scheduler). `main.go` chỉ orchestrate.

**(C2) Đánh số bình luận sai thứ tự**
- Có **hai section đánh số `11.`** (dòng 130 — Flink Status Poller, dòng 222 — Cron Scheduler).
- Section `// 6. Init Repositories` → `// 7. Init Services` → `// 8. Init Handlers` → `// 9. Kong Integration` → `// 10. Start Flink Status Poller` → `// 11. Init Router` → `// 11. Khởi tạo Cron Scheduler` → `// 12. Start Server`.
- → Lỗi đánh số, dễ gây nhầm khi review/diff. Nên bỏ đánh số hoặc đánh lại liên tục.

**(C3) Sử dụng global state không nhất quán**
- `config.AppConfig` (global var) và `logger.Log` (global var) được tham chiếu trực tiếp khắp file.
- Trong khi `integration-service` (`CLAUDE.md` đã định nghĩa convention chung) yêu cầu **logger inject qua constructor**.
- Một số service tuân thủ (`NewAuditLogService(auditRepo, logger.Log)`, `NewFlinkService(... logger.Log)`, `NewDataSourceService(... logger.Log)`); nhưng `NewKafkaService`, `NewKafkaManager`, `NewKafkaMonitorService`, `NewConnectedSystemService`, `NewNguoiDanService`, `NewSchemaRegistryService`, `NewKongClient`, `NewNotifier`, `NewRouteConfigService`, `NewKongAuthService` thì không nhận logger.
- → Inconsistency rõ giữa nội bộ admin-service và giữa hai service trong cùng repo.

**(C4) Trộn package `log` chuẩn và `zap`**
- `log.Fatalf("Failed to start server: %v", err)` ở dòng 265 — trong khi mọi `logger.Fatal(...)` khác đều qua zap → log cuối cùng (lỗi nghiêm trọng nhất) lại không vào OTEL/SigNoz và không có cấu trúc field.
- → Đổi sang `logger.Fatal("Failed to start server", zap.Error(err))`.

**(C5) Package name dùng kebab-case**
- Import `khomosynchandler "adm-srv-go-api/internal/handler/kho-mo-sync"`, `quantriphanmemhandler ".../quan-tri-phan-mem"`, `schemaregistryhandler ".../schema-registry"`.
- Tên folder kebab-case là chấp nhận được, nhưng **package Go không nên có dấu `-`** (Go spec không cho phép `-` trong identifier; package được declare lại bằng tên hợp lệ ở mỗi file). Lý do tồn tại của alias dài là vì điều này.
- → Đổi folder sang snake_case hoặc gộp lại (`khomosync`, `quantriphanmem`, `schemaregistry`). Trong codebase này `integration-service` cũng chỉ dùng folder không dấu (`khomo`).

**(C6) Vault block bị comment chết**
- Dòng 38–41: comment block khởi tạo Vault. Theo `docs/code-standards.md`: *"sửa trực tiếp file hiện có nếu hợp lý, tránh tạo file thừa"* — và global rule: *"No `// removed` comments for removed code"*.
- → Hoặc revert lại nếu cần, hoặc xoá hẳn comment dead-code.

**(C7) Không có graceful shutdown**
- `r.Run(":" + cfg.AppPort)` block đến khi process die. Các `defer pollerCancel()`, `defer c.Stop()`, `defer logger.Log.Sync()` thực tế **không bao giờ chạy** trong vòng đời thực — vì khi nhận SIGTERM, Gin không tự shutdown HTTP server, không drain connections, và `r.Run` không return.
- → Dùng `http.Server` + `signal.Notify` + `srv.Shutdown(ctx)` để defer mới hữu nghĩa.

**(C8) AutoMigrate 18 model trong main**
- `code-standards.md`: *"repo hiện dùng AutoMigrate; khi thêm model mới, review kỹ tác động schema"*. Trong môi trường nhiều model + nhiều dev → 1 block 18 dòng phình to liên tục, dễ merge conflict.
- → Tách thành function `runMigrations(db)` trong `internal/migrate/` (hoặc tách hẳn migrator tool dùng `golang-migrate`/`atlas` cho production).

**(C9) Trộn pattern register routes**
- Phần lớn route đăng ký inline ngay trong main (`api.GET("/kafka/topics", ...)` …).
- Hai handler dùng pattern khác: `dataSourceHandler.RegisterRoutes(api)` (dòng 216) và `flinkHandler.RegisterRoutes(r)` (dòng 220) — handler tự register routes.
- → Chọn 1 pattern và áp dụng đồng đều. Pattern `RegisterRoutes` thường tốt hơn vì route gần handler, dễ test, dễ tách file. Hiện hỗn hợp → khó tìm route khi debug.

**(C10) Group rỗng**
- `connectedSystems := api.Group("")` (dòng 167) — dùng group rỗng chỉ để gắn middleware. Rồi tiếp tục `connectedSystems.POST("/connected-systems/search", ...)` ở **ngoài** block middleware (dòng 177-178) → 2 endpoint search/get này có chạy qua middleware hay không tuỳ thuộc reader có nhận ra không.
- → Tách rõ: route nào cần audit thì trong `api.Group("/connected-systems", middleware.AdminSystemLog(...))`; route không cần thì ở group khác. Hiện trạng dễ gây sai sót khi thêm route mới.

**(C11) Truyền `nil` context**
- Dòng 234: `khoMoSyncHandler.TriggerSync(nil)` từ trong cron lambda → handler có thể `panic` nếu deref context. Theo Go convention: dùng `context.Background()` hoặc tạo `context.WithTimeout(...)` cho job nền.
- → `ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second); defer cancel(); khoMoSyncHandler.TriggerSync(ctx)`.

**(C12) Comment tiếng Việt vs tiếng Anh không đồng nhất**
- Mix `// 1. Load Config`, `// 7. Init Services` (English) với `// Kho Mở: trigger sync → gọi integration-service`, `// 11. Khởi tạo Cron Scheduler cho Kho Mở Sync` (Vietnamese).
- Global rule khuyến nghị **comment tiếng Việt mô tả nghiệp vụ, identifier tiếng Anh**. Hiện trạng có thể chấp nhận nhưng nên thống nhất một chiến lược (vd: comment "what" bằng tiếng Việt, comment đánh số section bỏ).

---

## 3. Đánh giá performance

### 3.1. Database

**(P1) Không cấu hình connection pool**
```go
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
```
GORM/`pgx` mặc định: `MaxOpenConns = unlimited`, `MaxIdleConns = 2`, `ConnMaxLifetime = 0`.
- Hệ quả: dưới tải cao có thể mở quá nhiều connection → Postgres tiêu hết `max_connections`. Trên Windows/Linux container, mỗi PG conn ~10MB RAM phía server.
- Idle = 2 trong khi 9 repository + cron + poller có thể yêu cầu đồng thời → liên tục mở/đóng conn.
- → Đặt:
  ```go
  sqlDB, _ := db.DB()
  sqlDB.SetMaxOpenConns(50)
  sqlDB.SetMaxIdleConns(10)
  sqlDB.SetConnMaxLifetime(30 * time.Minute)
  sqlDB.SetConnMaxIdleTime(5 * time.Minute)
  ```

**(P2) AutoMigrate chạy đồng bộ khi startup**
- 18 model → 18 lần `CREATE TABLE IF NOT EXISTS` + `ALTER` các index → startup time tăng và **block** khi DB lag.
- Trong rolling deploy nhiều replica, mỗi pod đều migrate → contention trên schema lock.
- → Tách migration step riêng (init container/job), hoặc gắn flag `AUTO_MIGRATE=false` cho production.

### 3.2. Kafka

**(P3) 3 client Kafka tách rời**
```go
kafkaSvc       := service.NewKafkaService(kafkaRepo, brokers)
kafkaManager   := service.NewKafkaManager(brokers)
kafkaMonitorSvc:= service.NewKafkaMonitorService(brokers)
```
- 3 service đều split `brokers` từ string mỗi lần → cấp 3 set TCP connection riêng tới cluster.
- Với cluster 3 broker → 9 TCP conn idle + handshake (TLS nếu prod).
- → Pre-split brokers `[]string` ở `main`, dùng chung; cân nhắc inject shared `*kafka.Conn`/`AdminClient` qua DI.

**(P4) String split lặp 3 lần**
- `strings.Split(config.AppConfig.KafkaBrokers, ",")` xuất hiện ở dòng 93, 94, 105. Nhỏ về cost nhưng là code smell — vi phạm DRY trong code-standards.

### 3.3. HTTP server

**(P5) Không cấu hình timeout**
- `r.Run(...)` dùng `http.Server` mặc định: không `ReadTimeout`, không `WriteTimeout`, không `IdleTimeout` → vulnerable to slowloris (giữ socket mở tiêu tài nguyên).
- → Khởi tạo `http.Server` explicit:
  ```go
  srv := &http.Server{
      Addr:         ":" + cfg.AppPort,
      Handler:      r,
      ReadTimeout:  10 * time.Second,
      WriteTimeout: 30 * time.Second,
      IdleTimeout:  60 * time.Second,
  }
  ```

**(P6) `gin.Default()` luôn bật Logger middleware**
- Logger middleware in mọi request ra stdout → I/O cost cao nếu QPS tăng. `LoggerWithConfig` cho phép skip path (vd `/health`).
- → Cho phép skip `/health` và `/api/v1/health/*` để giảm noise và I/O.

**(P7) `MaxMultipartMemory = 15MB`**
- Hợp lý cho upload xlsx schema. Tuy nhiên nếu attacker upload file lớn liên tục → mỗi request chiếm 15MB RAM → cần thêm rate-limit middleware hoặc giới hạn tổng concurrent upload.

### 3.4. Concurrency

**(P8) Flink Status Poller goroutine không có recover**
```go
pollerCtx, pollerCancel := context.WithCancel(context.Background())
defer pollerCancel()
statusPoller := service.NewFlinkStatusPoller(...)
go statusPoller.Start(pollerCtx)
```
- Nếu goroutine panic, không có `recover` ở entrypoint → crash process.
- Cần xác nhận trong `statusPoller.Start` có defer recover. Nếu không → bổ sung wrapper:
  ```go
  go func() {
      defer func() {
          if r := recover(); r != nil { logger.Error("poller panic", zap.Any("panic", r)) }
      }()
      statusPoller.Start(pollerCtx)
  }()
  ```

**(P9) Cron + HTTP trigger không có concurrency guard**
- Cron đặt mặc định `*/15 * * * *`. Nếu một `Sync` chạy quá 15 phút (gọi integration-service async) → cron tick tiếp theo lại trigger → admin-service gửi request thứ 2 sang integration-service.
- `integration-service` có heartbeat guard (đã ghi trong CLAUDE.md), nên nguy cơ thấp; nhưng nên có Singleton lock ở admin (vd `sync.Mutex`, hoặc check status trước khi gọi).

### 3.5. Khởi động và shutdown

**(P10) Startup synchronous**
- Toàn bộ init theo trình tự: config → logger → DB connect → AutoMigrate → 9 repo → 12 service → 10 handler → Kong → Poller → Routes → Cron → Run.
- Mỗi bước cần dependency trước → không thể parallel.
- DB connect + migrate có thể chiếm phần lớn thời gian startup (vài giây).
- → Bình thường với scale hiện tại; nhưng nếu khởi động qua healthcheck Kubernetes thì cần `readinessProbe` đợi đủ thời gian.

**(P11) Không graceful shutdown** (đã nêu C7)
- Hệ quả performance: connection in-flight bị reset cứng → client thấy `connection reset by peer` thay vì 5xx có thông tin → khó debug và retry strategy của client phía Kong/integration có thể tăng load.

---

## 4. Bảng tóm tắt mức độ

| Mã | Vấn đề | Convention/Perf | Mức độ | Effort fix |
|---|---|---|---|---|
| C1 | File 267 LOC vượt chuẩn 200 | Convention | Trung bình | M |
| C2 | Đánh số section trùng `11.` | Convention | Thấp | S |
| C3 | Logger global trộn với inject | Convention | Trung bình | M |
| C4 | `log.Fatalf` ngoài zap | Convention | Thấp | S |
| C5 | Package kebab-case `kho-mo-sync` | Convention | Thấp | M |
| C6 | Vault block dead-code | Convention | Thấp | S |
| C7 | Thiếu graceful shutdown | Convention/Perf | **Cao** | M |
| C8 | AutoMigrate 18 model trong main | Convention | Trung bình | M |
| C9 | Pattern register route hỗn hợp | Convention | Trung bình | M |
| C10 | `api.Group("")` + middleware mơ hồ | Convention | Trung bình | S |
| C11 | Truyền `nil` context | Convention | **Cao** | S |
| C12 | Comment EN/VI lẫn lộn | Convention | Thấp | S |
| P1 | DB pool không cấu hình | Performance | **Cao** | S |
| P2 | AutoMigrate đồng bộ khi startup | Performance | Trung bình | M |
| P3 | 3 Kafka client tách rời | Performance | Trung bình | M |
| P4 | `strings.Split` lặp 3 lần | Performance | Thấp | S |
| P5 | HTTP server thiếu timeout | Performance/Bảo mật | **Cao** | S |
| P6 | Logger middleware không skip `/health` | Performance | Thấp | S |
| P7 | MaxMultipartMemory không kèm rate limit | Performance/Bảo mật | Trung bình | M |
| P8 | Goroutine poller có thể không có recover | Performance | Trung bình | S |
| P9 | Cron + HTTP không có guard | Performance | Trung bình | S |
| P10 | Startup synchronous | Performance | Thấp | M |
| P11 | Không graceful shutdown ảnh hưởng client | Performance | **Cao** | M (đã ở C7) |

Effort: **S** = <1h, **M** = nửa ngày, **L** = >1 ngày.

---

## 5. Đề xuất ưu tiên

**Sprint ngay (S, ảnh hưởng ổn định):**
1. C11: thay `nil` bằng `context.WithTimeout(...)` trong cron.
2. P1: cấu hình `SetMaxOpenConns`/`SetMaxIdleConns`/`SetConnMaxLifetime`.
3. P5: dùng `http.Server` explicit với timeouts.
4. C4: thống nhất `logger.Fatal` ở mọi nơi.
5. C2 + C6: dọn comment đánh số và Vault dead-code.

**Sprint kế (M, tái cấu trúc):**
6. C7 + P11: graceful shutdown với `signal.Notify` + `srv.Shutdown(ctx)`. Khi đó các `defer cancel/Stop/Sync` mới có ý nghĩa.
7. C1 + C9: tách `wire.go`, `routes.go`, `cron.go`. Áp dụng pattern `RegisterRoutes` cho toàn bộ handler.
8. C3: bỏ `logger.Log` global → inject qua constructor cho mọi service mới; refactor dần các service cũ.
9. P3: gom Kafka brokers split 1 lần, xem xét share AdminClient cho `KafkaService`/`KafkaManager`/`KafkaMonitor`.

**Backlog (L):**
10. C8 + P2: tách migration thành tool/job riêng dùng `golang-migrate` hoặc `atlas`.
11. C5: rename package folder bỏ dấu `-`.
12. P9: thêm in-memory mutex hoặc DB-based lease cho cron job để tránh trigger chồng.

---

## 6. Tham chiếu

- `docs/code-standards.md` — chuẩn nội bộ về size file, layout, observability.
- `src/services/integration-service/CLAUDE.md` — convention logger inject, graceful shutdown trong sync pipeline.
- `ai-standards/.claude/rules/backend/04-go-microservices.md` — chuẩn chung Go microservice.
- File phân tích: `docs/PhanTich/admin-service-main-analysis.md` (tài liệu này).
