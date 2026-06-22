# PLAN: Kho Mở API Sync Pipeline
> **Dành cho AI Agent** — Implement toàn bộ luồng fetch dữ liệu từ API Kho Dữ Liệu Mở  
> Project: `adm-srv-go-api` + `dmst-integration-ingest`  
> Ngày: 2026-04-23  
> Reviewed: 2026-04-23 — Đã fix 4 BUGs + 5 Design Issues + DLQ

---

## 0. Tổng quan luồng thiết kế

```
[STEP 0] Probe call (page=1&size=1)
         → Kiểm tra count == 0 (rỗng) -> Dừng sớm.
         → Verify Schema Registry 1 lần duy nhất với items[0].
         → PAGE_SIZE = 100 (configurable qua env).
         → Khôi phục checkpoint từ PostgreSQL.
              │
              ▼
[STEP 1] Fetcher goroutine (1 goroutine)
         → RateLimiter (Token bucket)
         → Retry + Exponential Backoff (500ms -> 30s)
         → Circuit Breaker: 5 lần fail liên tiếp → dừng fetcher
         → Timeout per request: 30s
         → Fail → ghi DLQ (bảng job_failed_pages)
         → Đẩy struct `PageBatch` vào jobs channel.
              │
              ▼ jobs chan (buffer = WORKER_COUNT * 3 = 60)
              │
[STEP 2] Worker Pool (20 goroutines)
         → Rút `PageBatch` ra xử lý.
         → Transform: KhoMoPageResponse → KhoMoReceivePayload
         → Gửi xuống ingest service (via IngestClient).
         → Fail → ghi DLQ (bảng job_failed_pages)
         → Xử lý xong -> Bắn `page_id` vào `ackCh`.
              │
              ▼ ackCh (buffer 200)
              │
[STEP 3] Checkpoint Aggregator (1 goroutine) — Bitmap pattern
         → Gom các `page_id` hoàn thành vào bitmap.
         → Tính `last_contiguous_page` (trang liền kề cao nhất đã xong).
         → Ticker 10s: Flush DB. Nhận SIGTERM: Flush lần cuối.
              │
              ▼
[STEP 4] dmst-integration-ingest /api/v1/kho-mo/receive
         → Schema validate (Avro)
         → Delta filter (Redis MGET → compare phienBan)
         → Kafka batch publish → dmst.kho-mo.raw
```

---

## 1. Probe Call & Schema Verify (STEP 0)

### 1.1 Mục đích
Gọi `page=1&size=1` để:
- Lấy `response.data.meta.count` → tính `totalPages`
- Lấy `response.data.items[0]` → verify với Avro Schema Registry
- Nếu schema fail → dừng ngay, không phí tài nguyên fetch toàn bộ

### 1.2 Tính totalPages & giới hạn hợp lý

```go
const (
    PAGE_SIZE      = 100          // số bản ghi mỗi lần gọi
    MAX_PAGES_HARD = 10_000       // hard cap an toàn: 10_000 * 100 = 1,000,000 records
    MAX_PAGES_WARN = 5_000        // log warning nếu vượt ngưỡng này
)

func calcTotalPages(count int32, pageSize int) int {
    pages := int(count) / pageSize
    if int(count)%pageSize != 0 {
        pages++ // dư → cần thêm 1 page
    }
    if pages > MAX_PAGES_HARD {
        log.Warn("count rất lớn, đang cap tại MAX_PAGES_HARD",
            zap.Int32("api_count", count),
            zap.Int("capped_pages", MAX_PAGES_HARD),
        )
        return MAX_PAGES_HARD
    }
    if pages > MAX_PAGES_WARN {
        log.Warn("count vượt ngưỡng cảnh báo", zap.Int("pages", pages))
    }
    return pages
}
```

> **Lý do MAX_PAGES_HARD = 10,000:**  
> - API nguồn trả `count=755` → 8 pages  
> - Nếu count tăng lên 1,000,000 → 10,000 pages (1M records) vẫn trong giới hạn  
> - Nếu API bị lỗi trả count = 999,999,999 → không bị loop vô hạn  
> - Giá trị này nên đưa vào config (`MAX_PAGES_CAP`) để dễ thay đổi

### 1.3 Schema Verify logic

```go
func (s *KhoMoSyncService) probeAndVerify(ctx context.Context) (totalCount int32, err error) {
    resp, err := s.fetchPage(ctx, 1, 1) // page=1, size=1
    if err != nil {
        return 0, fmt.Errorf("probe call thất bại: %w", err)
    }

    // Verify schema với item đầu tiên
    if len(resp.Data.Items) > 0 {
        itemBytes, _ := json.Marshal(resp.Data.Items[0])
        if err := s.schemaValidator.Validate(ctx, s.cfg.KhoMoSchemaSubject, itemBytes); err != nil {
            return 0, fmt.Errorf("schema verify thất bại, dừng sync: %w", err)
        }
    }
    return resp.Data.Meta.Count, nil
}
```

---

## 2. Save Checkpoint — PostgreSQL

### 2.1 Cải tiến schema bảng `sync_state_data`

**Schema đề xuất ban đầu (cần cải thiện):**
```sql
job_id        TEXT
last_page     INT
status        TEXT  -- 'INPROGRESS','COMPLETED','FAILED'
last_run_time TIMESTAMP
```

**Schema cải thiện:**
```sql
CREATE TABLE sync_state_data (
    id                SERIAL PRIMARY KEY,
    job_id            VARCHAR(100) NOT NULL UNIQUE,  -- 'kho-mo-api'

    -- Tracking tiến độ
    last_success_page INT          NOT NULL DEFAULT 0,   -- page cuối THÀNH CÔNG (không phải đang xử lý)
    total_pages       INT          NOT NULL DEFAULT 0,   -- tổng số pages tính từ count
    total_count       INT          NOT NULL DEFAULT 0,   -- count từ API lúc bắt đầu run
    page_size         INT          NOT NULL DEFAULT 100, -- size đã dùng để tính

    -- Thống kê
    records_fetched   INT          NOT NULL DEFAULT 0,   -- tổng records đã fetch
    records_published INT          NOT NULL DEFAULT 0,   -- tổng records đã publish Kafka

    -- Trạng thái
    status            VARCHAR(20)  NOT NULL DEFAULT 'IDLE',
    -- 'IDLE' | 'INPROGRESS' | 'COMPLETED' | 'FAILED'

    error_message     TEXT,                              -- lỗi cuối nếu FAILED

    -- Thời gian
    started_at        TIMESTAMP,                         -- lần run hiện tại bắt đầu lúc nào
    completed_at      TIMESTAMP,                         -- hoàn thành lúc nào
    last_updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(), -- ticker cập nhật
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

**Lý do cải thiện từng field:**

| Field mới | Lý do thêm |
|---|---|
| `last_success_page` (thay `last_page`) | Tên rõ ràng: chỉ lưu page đã THÀNH CÔNG, tránh nhầm với page đang xử lý |
| `total_pages` | Biết tổng để tính % progress: `last_success_page / total_pages * 100` |
| `total_count` | Nếu count thay đổi giữa các run, so sánh được |
| `page_size` | Nếu PAGE_SIZE thay đổi config, tính lại totalPages đúng |
| `records_fetched` / `records_published` | Audit: biết bao nhiêu đã tới Kafka |
| `status = 'IDLE'` | Phân biệt chưa chạy lần nào với đang chạy |
| `error_message` | Debug nhanh khi FAILED không cần xem log |
| `started_at` / `completed_at` | Đo được thời gian mỗi lần sync |
| `last_updated_at` | Biết Ticker có đang hoạt động không (heartbeat) |

### 2.2 Go struct & repository

```go
// model/sync_state.go
type SyncState struct {
    ID               uint      `gorm:"primarykey;autoIncrement"`
    JobID            string    `gorm:"uniqueIndex;type:varchar(100)" json:"job_id"`
    LastSuccessPage  int       `json:"last_success_page"`
    TotalPages       int       `json:"total_pages"`
    TotalCount       int32     `json:"total_count"`
    PageSize         int       `json:"page_size"`
    RecordsFetched   int64     `json:"records_fetched"`
    RecordsPublished int64     `json:"records_published"`
    Status           string    `gorm:"type:varchar(20)" json:"status"`
    ErrorMessage     string    `gorm:"type:text" json:"error_message,omitempty"`
    StartedAt        *time.Time `json:"started_at"`
    CompletedAt      *time.Time `json:"completed_at,omitempty"`
    LastUpdatedAt    time.Time `json:"last_updated_at"`
    CreatedAt        time.Time `json:"created_at"`
}

const (
    SyncStatusIdle       = "IDLE"
    SyncStatusInProgress = "INPROGRESS"
    SyncStatusCompleted  = "COMPLETED"
    SyncStatusFailed     = "FAILED"
)

// repository/sync_state_repo.go
type SyncStateRepository interface {
    LoadOrCreate(ctx context.Context, jobID string) (*model.SyncState, error)
    Save(ctx context.Context, state *model.SyncState) error
    MarkFailed(ctx context.Context, jobID string, errMsg string) error
    MarkCompleted(ctx context.Context, jobID string) error
}
```

### 2.3 Cơ chế Checkpoint Ticker

```go
// ── Bitmap Checkpoint Aggregator ──────────────────────────────
// Giải quyết BUG: 20 workers chạy song song, page hoàn thành KHÔNG theo thứ tự.
// Nếu dùng atomic.Store(page), page 5 xong trước page 3 → Store(5) → Store(3)
// → checkpoint = 3 → restart → page 5 bị re-process.
// Bitmap pattern: track từng page đã xong, tính last_contiguous_page chính xác.

type checkpointAggregator struct {
    mu              sync.Mutex
    completedPages  map[int]bool   // track từng page đã xong
    lastContiguous  int            // page liền kề cao nhất ĐÃ HOÀN THÀNH
    recordsFetched  int64
    recordsPublished int64
}

func newCheckpointAggregator(startPage int) *checkpointAggregator {
    return &checkpointAggregator{
        completedPages: make(map[int]bool),
        lastContiguous: startPage - 1, // page trước startPage
    }
}

// MarkDone ghi nhận page đã xong, trả về lastContiguous mới.
func (a *checkpointAggregator) MarkDone(pageNum int, fetched, published int64) int {
    a.mu.Lock()
    defer a.mu.Unlock()

    a.completedPages[pageNum] = true
    a.recordsFetched += fetched
    a.recordsPublished += published

    // Advance lastContiguous: tìm chuỗi liên tục dài nhất
    for a.completedPages[a.lastContiguous+1] {
        a.lastContiguous++
        delete(a.completedPages, a.lastContiguous) // giải phóng memory
    }
    return a.lastContiguous
}

// Snapshot trả về trạng thái hiện tại (thread-safe) để flush vào DB.
func (a *checkpointAggregator) Snapshot() (lastPage int, fetched, published int64) {
    a.mu.Lock()
    defer a.mu.Unlock()
    return a.lastContiguous, a.recordsFetched, a.recordsPublished
}

// ── Checkpoint Ticker ─────────────────────────────────────────
// Goroutine ticker chạy ngầm, flush mỗi 10s

func (s *KhoMoSyncService) runCheckpointTicker(ctx context.Context, state *model.SyncState) {
    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            // Graceful shutdown → flush lần cuối
            s.flushCheckpoint(context.Background(), state)
            s.log.Info("[CHECKPOINT] Final flush on shutdown")
            return
        case <-ticker.C:
            s.flushCheckpoint(ctx, state)
        }
    }
}

func (s *KhoMoSyncService) flushCheckpoint(ctx context.Context, state *model.SyncState) {
    lastPage, fetched, published := s.aggregator.Snapshot()

    state.LastSuccessPage  = lastPage
    state.RecordsFetched   = fetched
    state.RecordsPublished = published
    state.LastUpdatedAt    = time.Now()

    if err := s.syncStateRepo.Save(ctx, state); err != nil {
        s.log.Error("[CHECKPOINT] Save failed", zap.Error(err))
    } else {
        s.log.Info("[CHECKPOINT] Flushed",
            zap.Int("last_contiguous_page", lastPage),
            zap.Int64("records_fetched", fetched),
        )
    }
}
```

### 2.4 Resume khi khởi động lại

```go
func (s *KhoMoSyncService) Run(ctx context.Context) error {
    // Load checkpoint
    state, err := s.syncStateRepo.LoadOrCreate(ctx, "kho-mo-api")
    if err != nil {
        return err
    }

    // Resume từ page đã dừng
    startPage := state.LastSuccessPage + 1

    switch state.Status {
    case SyncStatusCompleted:
        s.log.Info("Job đã COMPLETED trước đó, bắt đầu lại từ page 1")
        startPage = 1
        // Reset state cho run mới
        state.LastSuccessPage = 0
        state.RecordsFetched  = 0
        state.RecordsPublished = 0

    case SyncStatusInProgress:
        s.log.Info("[RESUME] Tiếp tục từ page", zap.Int("start_page", startPage))

    default: // IDLE, FAILED
        s.log.Info("Bắt đầu run mới từ page 1")
        startPage = 1
    }

    // Cập nhật state → INPROGRESS
    now := time.Now()
    state.Status    = SyncStatusInProgress
    state.StartedAt = &now
    s.syncStateRepo.Save(ctx, state)

    // ...tiếp tục pipeline
}
```

---

## 3. HTTP Client — RateLimit + Retry + Timeout

```go
// pkg/khomo/client.go

type KhoMoAPIClient struct {
    httpClient  *http.Client
    rateLimiter *rate.Limiter
    baseURL     string
    log         *zap.Logger
}

func NewKhoMoAPIClient(cfg *config.Config, log *zap.Logger) *KhoMoAPIClient {
    return &KhoMoAPIClient{
        httpClient: &http.Client{
            Timeout: 30 * time.Second,
            Transport: &http.Transport{
                MaxIdleConns:          50,
                MaxIdleConnsPerHost:   10,
                IdleConnTimeout:       90 * time.Second,
                ResponseHeaderTimeout: 10 * time.Second, // tách riêng với read timeout
                DisableCompression:    false,
            },
        },
        // 5 requests/giây, burst 10 — điều chỉnh theo API docs của kho mở
        rateLimiter: rate.NewLimiter(rate.Limit(cfg.KhoMoRateRPS), cfg.KhoMoRateBurst),
        baseURL:     strings.TrimRight(cfg.KhoMoAPIBaseURL, "/"),
        log:         log,
    }
}

func (c *KhoMoAPIClient) FetchPage(ctx context.Context, page, size int) (*KhoMoPageResponse, error) {
    // Rate limit: chờ token
    if err := c.rateLimiter.Wait(ctx); err != nil {
        return nil, fmt.Errorf("rate limiter cancelled: %w", err)
    }

    var result *KhoMoPageResponse

    // Exponential backoff: 500ms → 1s → 2s → 4s → 8s
    bo := backoff.NewExponentialBackOff()
    bo.InitialInterval = 500 * time.Millisecond
    bo.Multiplier      = 2.0
    bo.MaxInterval     = 30 * time.Second
    bo.MaxElapsedTime  = 2 * time.Minute // bỏ cuộc sau 2 phút

    attempt := 0
    op := func() error {
        attempt++
        url := fmt.Sprintf("%s?page=%d&size=%d", c.baseURL, page, size)
        req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
        if err != nil {
            return backoff.Permanent(fmt.Errorf("tạo request lỗi: %w", err))
        }

        resp, err := c.httpClient.Do(req)
        if err != nil {
            c.log.Warn("[RETRY] HTTP error", zap.Int("page", page), zap.Int("attempt", attempt), zap.Error(err))
            return err // retry
        }
        defer resp.Body.Close()

        // 429 Too Many Requests
        if resp.StatusCode == http.StatusTooManyRequests {
            retryAfter := resp.Header.Get("Retry-After")
            if secs, err2 := strconv.Atoi(retryAfter); err2 == nil {
                time.Sleep(time.Duration(secs) * time.Second)
            }
            return fmt.Errorf("429 Too Many Requests page=%d", page)
        }

        // 5xx Server Error → retry
        if resp.StatusCode >= 500 {
            return fmt.Errorf("server error %d page=%d", resp.StatusCode, page)
        }

        // 4xx Client Error → permanent (không retry)
        if resp.StatusCode >= 400 {
            return backoff.Permanent(fmt.Errorf("client error %d page=%d", resp.StatusCode, page))
        }

        // Parse response
        if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
            return backoff.Permanent(fmt.Errorf("decode lỗi page=%d: %w", page, err))
        }
        return nil
    }

    err := backoff.Retry(op, backoff.WithContext(bo, ctx))
    return result, err
}
```

---

## 4. Buffer Channel + Backpressure + Worker Pool + DLQ

### 4.1 DLQ — Dead Letter Queue (PostgreSQL)

```sql
-- migration: create_job_failed_pages.sql
CREATE TABLE IF NOT EXISTS job_failed_pages (
    id          SERIAL PRIMARY KEY,
    job_id      VARCHAR(100) NOT NULL,       -- 'kho-mo-api'
    page_num    INT          NOT NULL,       -- page bị lỗi
    phase       VARCHAR(20)  NOT NULL,       -- 'FETCH' hoặc 'PROCESS'
    error_msg   TEXT         NOT NULL,       -- chi tiết lỗi
    retry_count INT          NOT NULL DEFAULT 0,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    -- 'PENDING' | 'RETRIED' | 'RESOLVED'
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP,

    CONSTRAINT job_failed_pages_status_check
        CHECK (status IN ('PENDING','RETRIED','RESOLVED'))
);

CREATE INDEX idx_failed_pages_job_status ON job_failed_pages(job_id, status);
```

```go
// model/failed_page.go
type FailedPage struct {
    ID         uint      `gorm:"primarykey;autoIncrement"`
    JobID      string    `gorm:"type:varchar(100);index" json:"job_id"`
    PageNum    int       `json:"page_num"`
    Phase      string    `gorm:"type:varchar(20)" json:"phase"` // FETCH | PROCESS
    ErrorMsg   string    `gorm:"type:text" json:"error_msg"`
    RetryCount int       `json:"retry_count"`
    Status     string    `gorm:"type:varchar(20)" json:"status"` // PENDING | RETRIED | RESOLVED
    CreatedAt  time.Time `json:"created_at"`
    ResolvedAt *time.Time `json:"resolved_at,omitempty"`
}

const (
    FailedPhaseFetch   = "FETCH"
    FailedPhaseProcess = "PROCESS"
    FailedStatusPending  = "PENDING"
)

// repository/failed_page_repo.go
type FailedPageRepository interface {
    Create(ctx context.Context, fp *model.FailedPage) error
    ListPending(ctx context.Context, jobID string) ([]model.FailedPage, error)
    MarkResolved(ctx context.Context, id uint) error
}
```

### 4.2 IngestClient Interface

```go
// pkg/ingest/client.go
type IngestClient interface {
    SendToIngest(ctx context.Context, payload []byte) (*IngestResult, error)
}

type IngestResult struct {
    Status           string `json:"status"`
    Message          string `json:"message"`
    RecordsPublished int    `json:"records_published"`
}

type ingestHTTPClient struct {
    httpClient *http.Client
    baseURL    string
    log        *zap.Logger
}

func NewIngestClient(baseURL string, log *zap.Logger) IngestClient {
    return &ingestHTTPClient{
        httpClient: &http.Client{Timeout: 30 * time.Second},
        baseURL:    strings.TrimRight(baseURL, "/"),
        log:        log,
    }
}

func (c *ingestHTTPClient) SendToIngest(ctx context.Context, payload []byte) (*IngestResult, error) {
    url := fmt.Sprintf("%s/api/v1/kho-mo/receive", c.baseURL)
    req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
    if err != nil {
        return nil, fmt.Errorf("tạo request lỗi: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("gọi ingest service lỗi: %w", err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("ingest trả lỗi [%d]: %s", resp.StatusCode, string(body))
    }

    var result IngestResult
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("parse ingest response lỗi: %w", err)
    }
    return &result, nil
}
```

### 4.3 Transform Layer

```go
// KhoMoPageResponse (từ API Kho Mở) → KhoMoReceivePayload (cho ingest service)
// Hai struct này CÓ CẤU TRÚC KHÁC NHAU — cần transform rõ ràng.
func buildIngestPayload(pageResp *KhoMoPageResponse) *model.KhoMoReceivePayload {
    // Wrap items vào {"items": [...]} — đúng format dataNguonDuLieu
    itemsJSON, _ := json.Marshal(map[string]interface{}{
        "items": pageResp.Data.Items,
    })

    return &model.KhoMoReceivePayload{
        Succeeded:       pageResp.Succeeded,
        Errors:          pageResp.Errors,
        TraceId:         pageResp.TraceId,
        Page:            pageResp.Data.Meta.Page,
        Size:            pageResp.Data.Meta.Size,
        Count:           pageResp.Data.Meta.Count,
        DataNguonDuLieu: string(itemsJSON),
    }
}
```

### 4.4 Pipeline với DLQ + Circuit Breaker + Bitmap Aggregator

```go
// service/kho_mo_sync_service.go

const MAX_CONSECUTIVE_FAILS = 5 // Circuit breaker threshold

func (s *KhoMoSyncService) runPipeline(ctx context.Context, state *model.SyncState, startPage, totalPages int) error {
    // Buffer = WORKER_COUNT * 3 — đủ để fetcher không block, không tốn quá nhiều RAM
    chanBuffer := s.cfg.KhoMoWorkerCount * 3
    jobs := make(chan *KhoMoPageResponse, chanBuffer)

    // Khởi tạo Bitmap Aggregator từ startPage
    s.aggregator = newCheckpointAggregator(startPage)

    var workerWg sync.WaitGroup

    // ── Spawn Worker Pool ──────────────────────────────────────
    for i := 0; i < s.cfg.KhoMoWorkerCount; i++ {
        workerWg.Add(1)
        go func(workerID int) {
            defer workerWg.Done()
            for pageResp := range jobs {
                pageNum := int(pageResp.Data.Meta.Page)
                itemCount := int64(len(pageResp.Data.Items))

                if err := s.processPage(ctx, pageResp); err != nil {
                    s.log.Error("[WORKER] processPage lỗi",
                        zap.Int("worker", workerID),
                        zap.Int("page", pageNum),
                        zap.Error(err),
                    )
                    // ── DLQ: ghi page lỗi vào PostgreSQL ──
                    s.writeDLQ(ctx, pageNum, FailedPhaseProcess, err)
                    continue
                }

                // ── Bitmap Aggregator: ghi nhận page đã xong ──
                newContiguous := s.aggregator.MarkDone(pageNum, itemCount, int64(0))
                s.log.Debug("[WORKER] Page done",
                    zap.Int("page", pageNum),
                    zap.Int("last_contiguous", newContiguous),
                )
            }
        }(i)
    }

    // ── Fetcher goroutine — producer + Circuit Breaker ─────────
    go func() {
        defer close(jobs) // báo workers không còn job
        consecutiveFails := 0

        for page := startPage; page <= totalPages; page++ {
            select {
            case <-ctx.Done():
                s.log.Info("[FETCHER] Context cancelled, dừng fetch")
                return
            default:
            }

            pageResp, err := s.apiClient.FetchPage(ctx, page, s.cfg.KhoMoPageSize)
            if err != nil {
                consecutiveFails++
                s.log.Error("[FETCHER] FetchPage thất bại sau tất cả retry",
                    zap.Int("page", page),
                    zap.Int("consecutive_fails", consecutiveFails),
                    zap.Error(err),
                )

                // ── DLQ: ghi page lỗi ──
                s.writeDLQ(ctx, page, FailedPhaseFetch, err)

                // ── Circuit Breaker: 5 lần liên tiếp → dừng ──
                if consecutiveFails >= MAX_CONSECUTIVE_FAILS {
                    s.log.Error("[FETCHER] Circuit breaker triggered, dừng fetch",
                        zap.Int("consecutive_fails", consecutiveFails),
                        zap.Int("stopped_at_page", page),
                    )
                    return
                }
                continue
            }
            consecutiveFails = 0 // reset khi thành công

            // Đẩy vào channel — Backpressure tự nhiên
            select {
            case jobs <- pageResp:
                s.log.Debug("[FETCHER] Enqueued page", zap.Int("page", page))
            case <-ctx.Done():
                return
            }
        }
        s.log.Info("[FETCHER] Đã fetch xong tất cả pages")
    }()

    // Chờ tất cả workers hoàn thành
    workerWg.Wait()

    // ── Pipeline summary log ──────────────────────────────────
    lastPage, fetched, published := s.aggregator.Snapshot()
    s.log.Info("[PIPELINE] Completed",
        zap.Duration("elapsed", time.Since(*state.StartedAt)),
        zap.Int("total_pages", totalPages),
        zap.Int("last_contiguous_page", lastPage),
        zap.Int64("records_fetched", fetched),
        zap.Int64("records_published", published),
    )

    return nil
}

// writeDLQ ghi page lỗi vào bảng job_failed_pages.
func (s *KhoMoSyncService) writeDLQ(ctx context.Context, pageNum int, phase string, err error) {
    fp := &model.FailedPage{
        JobID:    "kho-mo-api",
        PageNum:  pageNum,
        Phase:    phase,
        ErrorMsg: err.Error(),
        Status:   FailedStatusPending,
    }
    if dlqErr := s.failedPageRepo.Create(ctx, fp); dlqErr != nil {
        s.log.Error("[DLQ] Không thể ghi failed page", zap.Error(dlqErr))
    }
}

// processPage transform + gửi 1 page data xuống dmst-integration-ingest
func (s *KhoMoSyncService) processPage(ctx context.Context, pageResp *KhoMoPageResponse) error {
    // Transform: KhoMoPageResponse → KhoMoReceivePayload
    payload := buildIngestPayload(pageResp)
    bodyBytes, err := json.Marshal(payload)
    if err != nil {
        return err
    }

    result, err := s.ingestClient.SendToIngest(ctx, bodyBytes)
    if err != nil {
        return err
    }

    // Cập nhật records_published qua aggregator
    s.aggregator.MarkDone(
        int(pageResp.Data.Meta.Page),
        0, // fetched đã tính ở worker
        int64(result.RecordsPublished),
    )
    return nil
}
```

---

## 5. Goroutine hiện tại vs Khi nào cần AsyncQ (Asynq)

### Goroutine đủ dùng khi:
- Single server / single pod
- count < 500,000 records (< 5,000 pages)
- Chấp nhận re-process khi crash (checkpoint đã cover)
- Không cần monitor real-time số pages đang chạy
- Team nhỏ, không cần distributed worker

### Cần chuyển sang Asynq khi:
| Tình huống | Dấu hiệu |
|---|---|
| count > 1,000,000 và cần scale ngang | 1 pod không đủ CPU/RAM |
| Cần retry task-level (không phải request-level) | Page X fail → retry riêng page X sau 5 phút |
| Cần monitor dashboard (đang ở page bao nhiêu, ETA) | Management yêu cầu visibility |
| Multi-job concurrency | Chạy song song nhiều nguồn dữ liệu khác nhau |
| Cần dead-letter queue | Page fail > 5 lần → đưa vào DLQ để review |

**Kết luận cho case hiện tại (count=755, dự kiến tăng lên vài chục ngàn):**  
→ **Goroutine + Checkpoint là đủ**. Asynq là over-engineering ở giai đoạn này.

---

## 6. Cấu trúc file cần tạo/chỉnh sửa

### Trong `adm-srv-go-api`:

```
internal/
  service/
    kho-mo-sync/
      service.go          ← THAY THẾ kho-mo-forward/service.go
                            (logic mới: pagination + pipeline + DLQ)
      aggregator.go       ← MỚI: checkpointAggregator (bitmap pattern)
      transform.go        ← MỚI: buildIngestPayload()
  handler/
    kho-mo-sync/
      handler.go          ← THAY THẾ kho-mo-ingest/handler.go
  model/
    sync_state.go         ← MỚI: struct SyncState, SyncStatus constants
    failed_page.go        ← MỚI: struct FailedPage (DLQ model)
  repository/
    sync_state_repo.go    ← MỚI: LoadOrCreate, Save, MarkFailed, MarkCompleted
    failed_page_repo.go   ← MỚI: Create, ListPending, MarkResolved

pkg/
  khomo/
    client.go             ← MỚI: KhoMoAPIClient (RateLimit + Retry + Timeout)
    model.go              ← MỚI: KhoMoPageResponse, KhoMoMeta, KhoMoItem structs
  ingest/
    client.go             ← MỚI: IngestClient interface + HTTP implementation

internal/config/config.go ← CẬP NHẬT: thêm các env var mới
```

### Env vars mới cần thêm vào `config.go`:

```go
// Kho Mở API
KhoMoAPIBaseURL  string  `mapstructure:"KHO_MO_API_BASE_URL"`
KhoMoPageSize    int     `mapstructure:"KHO_MO_PAGE_SIZE"`      // default: 100
KhoMoMaxPagesCap int     `mapstructure:"KHO_MO_MAX_PAGES_CAP"`  // default: 10000
KhoMoRateRPS     float64 `mapstructure:"KHO_MO_RATE_RPS"`       // default: 5.0 (float64 cho rate.Limit)
KhoMoRateBurst   int     `mapstructure:"KHO_MO_RATE_BURST"`     // default: 10
KhoMoWorkerCount int     `mapstructure:"KHO_MO_WORKER_COUNT"`   // default: 20
KhoMoMaxConsecutiveFails int `mapstructure:"KHO_MO_MAX_CONSECUTIVE_FAILS"` // default: 5
```

---

## 7. SQL Migration

```sql
-- migration/001_create_sync_state_data.sql
CREATE TABLE IF NOT EXISTS sync_state_data (
    id                SERIAL PRIMARY KEY,
    job_id            VARCHAR(100) NOT NULL,
    last_success_page INT          NOT NULL DEFAULT 0,
    total_pages       INT          NOT NULL DEFAULT 0,
    total_count       INT          NOT NULL DEFAULT 0,
    page_size         INT          NOT NULL DEFAULT 100,
    records_fetched   BIGINT       NOT NULL DEFAULT 0,
    records_published BIGINT       NOT NULL DEFAULT 0,
    status            VARCHAR(20)  NOT NULL DEFAULT 'IDLE',
    error_message     TEXT,
    started_at        TIMESTAMP,
    completed_at      TIMESTAMP,
    last_updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT sync_state_data_job_id_unique UNIQUE (job_id),
    CONSTRAINT sync_state_data_status_check
        CHECK (status IN ('IDLE','INPROGRESS','COMPLETED','FAILED'))
);

CREATE INDEX idx_sync_state_data_status ON sync_state_data(status);
CREATE INDEX idx_sync_state_data_job_id ON sync_state_data(job_id);

-- migration/002_create_job_failed_pages.sql (DLQ)
-- Xem chi tiết tại Section 4.1
CREATE TABLE IF NOT EXISTS job_failed_pages (
    id          SERIAL PRIMARY KEY,
    job_id      VARCHAR(100) NOT NULL,
    page_num    INT          NOT NULL,
    phase       VARCHAR(20)  NOT NULL,
    error_msg   TEXT         NOT NULL,
    retry_count INT          NOT NULL DEFAULT 0,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP,
    CONSTRAINT job_failed_pages_status_check
        CHECK (status IN ('PENDING','RETRIED','RESOLVED'))
);
CREATE INDEX idx_failed_pages_job_status ON job_failed_pages(job_id, status);
```

---

## 8. Models cần định nghĩa

```go
// pkg/khomo/model.go

// Response từ API Kho Mở
type KhoMoPageResponse struct {
    Succeeded bool          `json:"succeeded"`
    Errors    []string      `json:"errors"`
    Data      KhoMoData     `json:"data"`
    TraceId   string        `json:"traceId"`
}

type KhoMoData struct {
    Items []KhoMoItem `json:"items"`
    Meta  KhoMoMeta   `json:"meta"`
}

type KhoMoMeta struct {
    Page        int32   `json:"page"`
    Size        int32   `json:"size"`
    Count       int32   `json:"count"`       // ← QUAN TRỌNG: dùng để tính totalPages
    OrderBy     *string `json:"orderBy"`
    Countable   *bool   `json:"countable"`
    HasNextPage *bool   `json:"hasNextPage"`
}

// Item từng bản ghi (map với KhoMoRawItem trong dmst-integration-ingest)
type KhoMoItem struct {
    ID              string `json:"id"`
    Ten             string `json:"ten"`
    MaDinhDanhDl    string `json:"madinhdanhDl"`
    UdNguondulieuId string `json:"udNguondulieuId"`
    TenNguonDuLieu  string `json:"tenNguonDuLieu"`
    PhienBan        string `json:"phienBan"`
    TanSuatCapNhat  string `json:"tanSuatCapNhat"`
}
```

---

## 9. Graceful Shutdown

```go
// cmd/api/main.go — thêm signal handling cho sync job

sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)

go func() {
    sig := <-sigChan
    log.Info("Nhận signal, graceful shutdown...", zap.String("signal", sig.String()))
    // cancel() → context propagate tới Fetcher + Workers + Ticker
    // Ticker sẽ flush checkpoint lần cuối trước khi thoát
    cancel()
}()
```

---

## 10. Thứ tự implement cho AI Agent

```
Bước 1:  Định nghĩa models       → pkg/khomo/model.go
                                   → internal/model/sync_state.go
                                   → internal/model/failed_page.go (DLQ)

Bước 2:  SQL migration            → migration/001_create_sync_state_data.sql
                                   → migration/002_create_job_failed_pages.sql
                                   → thêm AutoMigrate(&model.SyncState{}, &model.FailedPage{}) trong main.go

Bước 3:  Repository               → internal/repository/sync_state_repo.go
                                   → internal/repository/failed_page_repo.go

Bước 4:  HTTP Client (API nguồn)  → pkg/khomo/client.go
                                   (RateLimit + Retry + Exponential Backoff + Timeout)

Bước 5:  IngestClient             → pkg/ingest/client.go
                                   (HTTP client gọi dmst-integration-ingest)

Bước 6:  Config                   → thêm env vars mới vào internal/config/config.go

Bước 7:  Checkpoint Aggregator    → internal/service/kho-mo-sync/aggregator.go
                                   (Bitmap pattern cho out-of-order tracking)

Bước 8:  Transform Layer          → internal/service/kho-mo-sync/transform.go
                                   (KhoMoPageResponse → KhoMoReceivePayload)

Bước 9:  Sync Service             → internal/service/kho-mo-sync/service.go
                                   (Probe + Pipeline + DLQ + Circuit Breaker)

Bước 10: Handler                  → internal/handler/kho-mo-sync/handler.go

Bước 11: Wire vào main.go         → khởi tạo dependencies, đăng ký route

Bước 12: Dependency               → go get github.com/cenkalti/backoff/v4
                                   (go.mod hiện có v3 từ Vault, plan cần v4)

Bước 13: Test thủ công            → POST /api/v1/kho-mo/sync
                                   → kiểm tra table sync_state_data
                                   → kiểm tra table job_failed_pages
                                   → kill process giữa chừng → restart → verify resume
                                   → verify DLQ có ghi đúng page lỗi
```

---

## 11. Checklist tích hợp

### Core Pipeline
- [ ] Probe call page=1&size=1 trước khi chạy pipeline
- [ ] Schema verify với item đầu tiên → fail thì dừng
- [ ] `totalPages = ceil(count / PAGE_SIZE)`, có hard cap `MAX_PAGES_CAP=10000`
- [ ] Checkpoint load khi startup, resume từ `last_success_page + 1`

### Rate Limiting & Resilience
- [ ] RateLimiter `rate.NewLimiter(float64)` bảo vệ API nguồn
- [ ] Retry với Exponential Backoff (500ms→30s max, 2 phút timeout tổng)
- [ ] Timeout 30s per request (tách `ResponseHeaderTimeout`)
- [ ] Circuit Breaker: 5 lần fail liên tiếp → dừng fetcher

### Worker Pool & Backpressure
- [ ] Buffer channel = WORKER_COUNT * 3 → Backpressure tự động
- [ ] Worker Pool từ config (default 20) — không spawn vô hạn

### Checkpoint Aggregator (Bitmap)
- [ ] Dùng Bitmap Aggregator — KHÔNG dùng atomic.Store (bug out-of-order)
- [ ] Tính `last_contiguous_page` chính xác khi worker hoàn thành không theo thứ tự
- [ ] Checkpoint Ticker 10s flush aggregator → PostgreSQL
- [ ] Flush checkpoint lần cuối khi nhận SIGTERM

### DLQ (Dead Letter Queue)
- [ ] Bảng `job_failed_pages` lưu page lỗi từ cả fetcher + worker
- [ ] Ghi `phase` (FETCH/PROCESS) để biết lỗi ở bước nào
- [ ] Endpoint hoặc query SQL để list pending failed pages

### Transform Layer
- [ ] `buildIngestPayload()` chuyển `KhoMoPageResponse → KhoMoReceivePayload`
- [ ] `dataNguonDuLieu` wrap đúng format `{"items": [...]}`

### IngestClient
- [ ] Interface `IngestClient` tách riêng, testable
- [ ] HTTP implementation gọi `/api/v1/kho-mo/receive`

### Observability
- [ ] `status` cập nhật đúng: IDLE → INPROGRESS → COMPLETED / FAILED
- [ ] Log đầy đủ: page, records_fetched, records_published, elapsed_time
- [ ] Pipeline summary log cuối mỗi run (pages/sec, duration)
- [ ] Tất cả config đều qua env var, có default hợp lý

### Dependency
- [ ] `go get github.com/cenkalti/backoff/v4` (khác v3 đang có trong go.mod)
