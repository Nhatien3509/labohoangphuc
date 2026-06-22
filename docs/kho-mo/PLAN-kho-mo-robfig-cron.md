# PLAN: Tích hợp robfig/cron vào Kho Mở Sync Pipeline
> **Dành cho AI Agent** — Task nhỏ, chỉ thêm scheduler vào service đã có  
> Đọc kỹ PLAN-kho-mo-api-sync-v2.md trước khi implement task này  
> Ngày: 2026-04-23

---

## Bối cảnh

Pipeline `KhoMoSyncService` đã implement đầy đủ (xem v2 plan).  
Task này **chỉ thêm cron scheduler** để tự động trigger job theo lịch.  
Không được sửa bất kỳ logic nào bên trong `KhoMoSyncService`.

---

## Yêu cầu

1. Job tự động chạy theo lịch cấu hình (default: `0 2 * * *` — 2AM hàng đêm)
2. Vẫn giữ route `POST /api/v1/kho-mo/sync` để manual trigger
3. **Chống concurrent run** bằng `sync_state_data.status` (bảng đã có sẵn)  
   — Không dùng `atomic.Bool`, lý do bên dưới

---

## Chống Concurrent Run — Dùng DB thay vì atomic.Bool

### Tại sao dùng DB?

```
atomic.Bool chỉ sống trong memory của 1 process.

Vấn đề:
  - Service restart giữa chừng → atomic.Bool reset về false
  - Job mới trigger ngay sau restart → chạy đè lên data đang dở
  - Multi-pod deploy (2 replicas) → mỗi pod có atomic.Bool riêng → không bảo vệ được

sync_state_data.status = 'INPROGRESS' đã tồn tại trong DB:
  - Persist qua restart
  - Shared across pods
  - Không cần thêm bất kỳ column nào
  - Logic check đơn giản: SELECT status WHERE job_id = 'kho-mo-api'
```

### Logic check trước khi chạy

```go
func (s *KhoMoSyncService) Run(ctx context.Context) error {
    state, err := s.syncStateRepo.LoadOrCreate(ctx, "kho-mo-api")
    if err != nil {
        return err
    }

    // Chống concurrent run bằng status trong DB
    if state.Status == SyncStatusInProgress {
        s.log.Warn("[SYNC] Job đang INPROGRESS trong DB, bỏ qua trigger",
            zap.Time("started_at", *state.StartedAt),
        )
        return fmt.Errorf("job đang chạy (started_at: %v)", state.StartedAt)
    }

    // Tiếp tục pipeline bình thường...
}
```

### Edge case: Stale INPROGRESS

```
Tình huống: Service crash (OOM, kill -9) mà không graceful shutdown
→ status vẫn là INPROGRESS trong DB mãi mãi
→ Cron trigger hôm sau bị block

Fix: Kiểm tra last_updated_at — nếu quá X giờ không update → coi là stale
```

```go
const staleThreshold = 6 * time.Hour // job chạy quá 6h → coi là stale/dead

if state.Status == SyncStatusInProgress {
    staleCutoff := time.Now().Add(-staleThreshold)
    if state.LastUpdatedAt.Before(staleCutoff) {
        s.log.Warn("[SYNC] Phát hiện stale INPROGRESS job, override và chạy lại",
            zap.Time("last_updated_at", state.LastUpdatedAt),
        )
        // Cho phép chạy tiếp, sẽ resume từ last_success_page
    } else {
        s.log.Warn("[SYNC] Job đang chạy thật sự, bỏ qua trigger này")
        return fmt.Errorf("job đang chạy (last_updated: %v)", state.LastUpdatedAt)
    }
}
```

> `last_updated_at` được Checkpoint Ticker cập nhật mỗi 10 giây  
> → Nếu job còn sống: `last_updated_at` luôn < 10s trước  
> → Nếu job chết (crash): `last_updated_at` không còn được update → stale sau 6h

---

## File cần tạo / chỉnh sửa

```
Chỉnh sửa:
  cmd/api/main.go                         ← thêm cron scheduler
  internal/service/kho-mo-sync/service.go ← thêm stale check trong Run()
  internal/config/config.go               ← thêm 2 env vars
  go.mod / go.sum                         ← thêm robfig/cron/v3
```

---

## Env vars mới

```go
// internal/config/config.go — thêm vào struct Config:
KhoMoCronEnabled     bool   `mapstructure:"KHO_MO_CRON_ENABLED"`
// default: true — set false để tắt cron trong môi trường dev/test mà không cần sửa schedule

KhoMoCronSchedule    string `mapstructure:"KHO_MO_CRON_SCHEDULE"`
// default: "0 2 * * *" (2AM hàng đêm)
// format: cron expression 5 field (phút giờ ngày tháng tuần)

KhoMoStaleThresholdH int    `mapstructure:"KHO_MO_STALE_THRESHOLD_HOURS"`
// default: 6 (giờ)
// nếu INPROGRESS mà last_updated_at > 6h trước → coi là stale, cho chạy lại
```

---

## Code thay đổi

### 1. `cmd/api/main.go` — thêm cron

```go
import "github.com/robfig/cron/v3"

// Sau khi khởi tạo syncService...

// ⚠️ FIX: cron.New() mặc định dùng 6-field (bao gồm giây ở đầu).
// Phải dùng WithParser để hỗ trợ 5-field standard cron expression.
// Nếu không, expression "0 2 * * *" sẽ báo lỗi parse.
if cfg.KhoMoCronEnabled {
    c := cron.New(cron.WithParser(cron.NewParser(
        cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor,
    )))

    entryID, err := c.AddFunc(cfg.KhoMoCronSchedule, func() {
        start := time.Now()
        logger.Log.Info("[CRON] Kho Mở sync job started")

        // Context riêng cho mỗi lần chạy — KHÔNG dùng ctx của main.
        // Timeout 4h: đủ cho ~10,000 pages × retry time.
        jobCtx, jobCancel := context.WithTimeout(context.Background(), 4*time.Hour)
        defer jobCancel()

        if err := khoMoSyncSvc.Run(jobCtx); err != nil {
            logger.Log.Error("[CRON] Sync job failed",
                zap.Error(err),
                zap.Duration("elapsed", time.Since(start)),
            )
            return
        }
        logger.Log.Info("[CRON] Sync job completed",
            zap.Duration("elapsed", time.Since(start)),
        )
    })
    if err != nil {
        logger.Fatal("Không thể đăng ký cron job", zap.Error(err))
    }

    c.Start()
    // Log next run time để operator biết lịch chạy tiếp theo
    if entries := c.Entries(); len(entries) > 0 {
        logger.Log.Info("[CRON] Scheduler started",
            zap.Int("entry_id", int(entryID)),
            zap.String("schedule", cfg.KhoMoCronSchedule),
            zap.Time("next_run", entries[0].Next),
        )
    }
    defer c.Stop() // chờ job đang chạy hoàn thành trước khi tắt
} else {
    logger.Log.Info("[CRON] Scheduler disabled (KHO_MO_CRON_ENABLED=false)")
}

// Gin vẫn giữ route manual trigger — KHÔNG xóa
api.POST("/kho-mo/sync", khoMoSyncHandler.Sync)
```

### 2. `internal/service/kho-mo-sync/service.go` — thêm stale check

Thêm vào đầu hàm `Run()`, trước toàn bộ logic hiện tại:

```go
func (s *KhoMoSyncService) Run(ctx context.Context) error {
    state, err := s.syncStateRepo.LoadOrCreate(ctx, "kho-mo-api")
    if err != nil {
        return fmt.Errorf("load checkpoint thất bại: %w", err)
    }

    // ── Chống concurrent run bằng DB status ──────────────────
    if state.Status == SyncStatusInProgress {
        staleThreshold := time.Duration(s.cfg.KhoMoStaleThresholdH) * time.Hour
        // minFreshTime: mốc thời gian tối thiểu để coi job là còn sống.
        // Nếu last_updated_at SAU mốc này → Checkpoint Ticker vẫn đang chạy → job sống.
        // Nếu last_updated_at TRƯỚC mốc này → Ticker đã ngừng → job crash (stale).
        minFreshTime := time.Now().Add(-staleThreshold)

        if state.LastUpdatedAt.After(minFreshTime) {
            // Job còn sống (Checkpoint Ticker vẫn đang update last_updated_at mỗi 10s)
            s.log.Warn("[SYNC] Job đang chạy thật sự, bỏ qua trigger",
                zap.Time("started_at",   *state.StartedAt),
                zap.Time("last_updated", state.LastUpdatedAt),
            )
            return fmt.Errorf("job đang chạy (last_updated: %v)", state.LastUpdatedAt)
        }

        // Job stale — crash mà không graceful shutdown
        s.log.Warn("[SYNC] Phát hiện stale job, resume và chạy tiếp",
            zap.Time("last_updated_at",  state.LastUpdatedAt),
            zap.Int("resume_from_page",  state.LastSuccessPage+1),
            zap.Duration("stale_threshold", staleThreshold),
        )
        // Không reset state → resume từ last_success_page (checkpoint vẫn còn giá trị)
    }
    // ──────────────────────────────────────────────────────────

    // ... toàn bộ pipeline hiện tại, không đổi gì
}
```

---

## Dependency

```bash
go get github.com/robfig/cron/v3
```

```
go.mod thêm:
  github.com/robfig/cron/v3  v3.0.1
```

---

## Thứ tự implement

```
Bước 1: go get github.com/robfig/cron/v3

Bước 2: internal/config/config.go
        → thêm KhoMoCronEnabled bool   (default: true)
        → thêm KhoMoCronSchedule string (default: "0 2 * * *")
        → thêm KhoMoStaleThresholdH int  (default: 6)
        → thêm viper.SetDefault cho cả 3 field trên

Bước 3: internal/service/kho-mo-sync/service.go
        → thêm stale check vào đầu Run() (dùng minFreshTime, không phải staleCutoff)
        → KHÔNG sửa bất kỳ logic nào khác trong pipeline

Bước 4: cmd/api/main.go
        → import robfig/cron/v3
        → QUAN TRỌNG: dùng cron.New(cron.WithParser(...)) — KHÔNG dùng cron.New() trống
        → bọc trong if cfg.KhoMoCronEnabled { ... }
        → AddFunc với elapsed log đầy đủ (start/success/error)
        → c.Start() + log next_run time
        → defer c.Stop() PHẢI nằm trong main() — không đặt trong hàm con

Bước 5: Verify
        → Set KHO_MO_CRON_SCHEDULE="* * * * *" (mỗi phút) để test
        → Kiểm tra log "[CRON] Sync job started" và "[CRON] Sync job completed" có elapsed
        → Kiểm tra log "[CRON] Scheduler started" có next_run time
        → Trigger manual POST /api/v1/kho-mo/sync trong khi cron đang chạy
        → Kiểm tra log "[SYNC] Job đang chạy thật sự, bỏ qua trigger"
        → Kill process (kill -9), restart → verify resume từ last_success_page
        → Đổi last_updated_at trong DB về 7h trước → trigger → verify stale override
        → Set KHO_MO_CRON_ENABLED=false → verify log "Scheduler disabled"
```

---

## Checklist

### Dependency
- [ ] `go get github.com/robfig/cron/v3`

### Config
- [ ] Thêm `KHO_MO_CRON_ENABLED` bool (default: `true`)
- [ ] Thêm `KHO_MO_CRON_SCHEDULE` string (default: `"0 2 * * *"`)
- [ ] Thêm `KHO_MO_STALE_THRESHOLD_HOURS` int (default: `6`)

### main.go
- [ ] Dùng `cron.New(cron.WithParser(...))` — **KHÔNG** dùng `cron.New()` trống (bug 5-field)
- [ ] Bọc toàn bộ cron init trong `if cfg.KhoMoCronEnabled { ... }`
- [ ] Log elapsed time khi job hoàn thành (success và error)
- [ ] Log `next_run` time sau `c.Start()` bằng `c.Entries()[0].Next`
- [ ] `defer c.Stop()` nằm trong `main()` — không đặt trong hàm con

### service.go
- [ ] Stale check dùng `minFreshTime` (không phải `staleCutoff`) — tên rõ nghĩa hơn
- [ ] Log thêm `stale_threshold` duration khi phát hiện stale job

### Invariants
- [ ] Context riêng cho mỗi cron run (không dùng main context), timeout 4h
- [ ] Giữ nguyên route manual `POST /api/v1/kho-mo/sync`
- [ ] Không sửa bất kỳ logic nào trong pipeline (Fetcher, Worker, Checkpoint, DLQ...)
