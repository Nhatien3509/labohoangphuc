# Checklist 2 Luồng API: Kho Mở
> Source: `dmst-admin-api` → `dmst-ingest-svc`

---

## LUỒNG 1 — POST `/api/v1/kho-mo/sync` (Cron Job Pipeline)

### 1. HTTP Entry — `KhoMoSyncHandler.Sync()`
- [ ] Nhận `POST /api/v1/kho-mo/sync`
- [ ] Tạo `context.WithTimeout` 10 phút (handler timeout riêng)
- [ ] Gọi `KhoMoSyncService.Run(ctx)`
- [ ] Trả `200 + elapsed` nếu thành công / `500 + error message` nếu thất bại

---

### 2. Concurrent Run Guard — `Service.Run()`
- [ ] `syncStateRepo.LoadOrCreate(ctx, "kho-mo-api")` → lấy hoặc tạo mới row trong `sync_state_data`
- [ ] Kiểm tra `state.Status == INPROGRESS`
  - [ ] Nếu `INPROGRESS` → so sánh `state.LastUpdatedAt` với `now - staleThreshold (2 phút)`
    - [ ] `LastUpdatedAt` còn mới (heartbeat sống) → return lỗi `"job đang chạy"`, **bỏ qua trigger**
    - [ ] `LastUpdatedAt` quá cũ (heartbeat chết) → log warn `"stale job"`, **cho phép resume**

---

### 3. Resolve Start Page
- [ ] `status == COMPLETED` → reset `LastSuccessPage=0`, `RecordsFetched=0`, `RecordsPublished=0`, bắt đầu từ **page 1**
- [ ] `status == INPROGRESS` (resume sau stale) → bắt đầu từ **`LastSuccessPage + 1`**
- [ ] `status == IDLE / FAILED` → bắt đầu từ **page 1**

---

### 4. Mark INPROGRESS
- [ ] Set `state.Status = INPROGRESS`, `state.StartedAt = now`, `state.PageSize = cfg.KhoMoPageSize`
- [ ] `syncStateRepo.Save(ctx, state)` → UPSERT vào `sync_state_data`

---

### 5. Probe Call — Verify trước khi chạy
- [ ] Gọi `apiClient.FetchPage(ctx, page=1, size=1)` qua `KhoMo HTTP Client`
  - [ ] `rateLimiter.Wait(ctx)` — chờ rate limit token (float64 RPS)
  - [ ] Retry với Exponential Backoff: `500ms → 1s → 2s → 4s → 8s`, max 2 phút
  - [ ] HTTP 429 → đọc `Retry-After` header, sleep, retry
  - [ ] HTTP 5xx → retry
  - [ ] HTTP 4xx → `backoff.Permanent`, **không retry**
- [ ] Lấy `response.data.meta.count` (tổng bản ghi trên API nguồn)
- [ ] Nếu `count == 0` → `MarkCompleted`, return sớm
- [ ] Nếu `cfg.KhoMoSchemaSubject != ""` và `schemaValidator != nil`:
  - [ ] Marshal `items[0]` → `[]byte`
  - [ ] `schemaValidator.Validate(ctx, subject, itemBytes)` → gọi Schema Registry
    - [ ] Check cache `sync.Map` trước
    - [ ] Nếu miss: `GET {SCHEMA_REGISTRY_URL}/subjects/{subject}/versions/latest`
    - [ ] Parse Avro schema với `hamba/avro`
    - [ ] `avro.Marshal(schema, floatToInt(payload))` để validate conform
  - [ ] Fail → `MarkFailed`, return lỗi, **dừng toàn bộ pipeline**

---

### 6. Tính Total Pages
- [ ] `totalPages = ceil(count / KhoMoPageSize)`
- [ ] Nếu `totalPages > KhoMoMaxPagesCap (default 10000)` → cap lại, log warn
- [ ] Cập nhật `state.TotalPages`, `state.TotalCount`

---

### 7. Khởi tạo Checkpoint Aggregator
- [ ] `newCheckpointAggregator(startPage)` → `lastContiguous = startPage - 1`, `completedPages = map[int]bool{}`
- [ ] Aggregator dùng **Bitmap pattern** thay vì `atomic.Store` để tránh worker chậm ghi đè checkpoint về sau

---

### 8. Checkpoint Ticker Goroutine (chạy ngầm)
- [ ] Spawn goroutine với `tickerCtx` (cancel khi pipeline xong)
- [ ] `time.NewTicker(10s)` → mỗi 10s flush một lần
- [ ] `aggregator.Snapshot()` → lấy `lastContiguous, recordsFetched, recordsPublished`
- [ ] `syncStateRepo.Save(ctx, state)` → UPDATE `sync_state_data` (heartbeat + checkpoint)
- [ ] Khi `tickerCtx.Done()` → **flush lần cuối** với `context.Background()` trước khi thoát

---

### 9. Fetcher Goroutine (Producer)
- [ ] Spawn goroutine riêng, `defer close(jobs)`
- [ ] Loop `page = startPage → totalPages`
  - [ ] Check `ctx.Done()` mỗi iteration → dừng ngay khi cancel
  - [ ] `apiClient.FetchPage(ctx, page, KhoMoPageSize)` (RateLimit + Retry như Probe)
  - [ ] **Fetch thành công** → reset `consecutiveFails = 0`, đẩy `pageResp` vào `jobs chan` (buffer = `WorkerCount × 3`)
    - [ ] `select { case jobs <- pageResp: ... case <-ctx.Done(): return }` → **backpressure tự nhiên** khi channel đầy
  - [ ] **Fetch thất bại** → `consecutiveFails++`, `writeDLQ(ctx, page, "FETCH", err)`
    - [ ] Nếu `consecutiveFails >= KhoMoMaxConsecutiveFails (default 5)` → log error `"Circuit breaker triggered"`, **dừng fetcher**
    - [ ] Chưa đạt ngưỡng → `continue` sang page tiếp theo

---

### 10. Worker Pool (20 goroutines song song)
- [ ] Spawn `KhoMoWorkerCount` goroutines, mỗi goroutine `range jobs`
- [ ] Mỗi worker nhận `*KhoMoPageResponse`:
  - [ ] `processPage(ctx, pageResp)`:
    - [ ] `buildIngestPayload(pageResp)` → map sang `ingestPayload`
      - [ ] `dataNguonDuLieu = json.Marshal({"items": pageResp.Data.Items})` — JSON **string**, không phải object
      - [ ] `Errors = []string{}` nếu nil (tránh JSON null)
    - [ ] `json.Marshal(payload)` → `[]byte`
    - [ ] `ingestClient.SendBatch(ctx, bodyBytes)` → `POST {INGEST_URL}/api/v1/kho-mo/receive`
      - [ ] Timeout 30s
      - [ ] HTTP 200 → parse `Result{RecordsPublished}`
      - [ ] HTTP != 200 → return error
  - [ ] **Thành công** → `aggregator.MarkDone(pageNum, itemCount, published)`
    - [ ] Bitmap: `completedPages[pageNum] = true`
    - [ ] Advance `lastContiguous` nếu các page liền kề đều done
    - [ ] Xóa entry đã advance khỏi map (tránh memory leak)
  - [ ] **Thất bại** → `writeDLQ(ctx, pageNum, "PROCESS", err)`, `continue`

---

### 11. DLQ — Dead Letter Queue
- [ ] `failedPageRepo.Create(ctx, &FailedPage{JobID, PageNum, Phase, ErrorMsg})`
- [ ] Lưu vào bảng `job_failed_pages` với `status = PENDING`
- [ ] Lỗi ghi DLQ chỉ **log, không panic** — không làm dừng pipeline

---

### 12. Final Flush + Mark Complete
- [ ] `workerWg.Wait()` — chờ tất cả workers xong
- [ ] `cancelTicker()` → dừng checkpoint ticker, trigger flush lần cuối
- [ ] `flushCheckpoint(context.Background(), state)` — flush cuối
- [ ] `syncStateRepo.MarkCompleted(ctx, "kho-mo-api")` → UPDATE `status=COMPLETED`, `completed_at=now`
- [ ] Nếu pipeline error → `syncStateRepo.MarkFailed(ctx, "kho-mo-api", errMsg)`

---

### 13. Cron Scheduler (nếu `KHO_MO_CRON_ENABLED=true`)
- [ ] `cron.New(cron.WithParser(...))` — 5-field parser (phút giờ ngày tháng tuần)
- [ ] `c.AddFunc(KhoMoCronSchedule, func() { ... })` — default `*/2 * * * *`
- [ ] Context riêng `context.WithTimeout(context.Background(), 4h)` cho mỗi lần chạy
- [ ] `c.Start()` + `defer c.Stop()` trong `main()`
- [ ] Log `next_run` time sau khi đăng ký thành công

---

## LUỒNG 2 — POST `/api/v1/kho-mo/ingest` (Mock Data Forward)

### 1. HTTP Entry — `KhoMoIngestHandler.Ingest()`
- [ ] Nhận `POST /api/v1/kho-mo/ingest`
- [ ] `c.ShouldBindJSON(&req)` → validate `fileName` bắt buộc có
- [ ] Tạo `context.WithTimeout` 25s
- [ ] Gọi `KhoMoForwardService.FetchAndForward(ctx, fileName)`
- [ ] Trả `200 + KhoMoForwardResult` nếu thành công / `500 + error` nếu thất bại

---

### 2. Validate File Name — Path Traversal Protection
- [ ] `validateFileName(fileName)`:
  - [ ] `fileName != ""` — không rỗng
  - [ ] `filepath.Ext(fileName) == ".json"` — chỉ cho phép `.json`
  - [ ] Không chứa `/`, `\`, `:`, `..` — ngăn path traversal attack

---

### 3. Đọc Mock File
- [ ] Build path: `json/{fileName}`
- [ ] `os.ReadFile(filePath)` → `[]byte`
- [ ] Lỗi không tìm thấy file → return lỗi ngay

---

### 4. Parse & Map JSON Mock
- [ ] `json.Unmarshal(rawData, &rawMap)` → `map[string]interface{}`
- [ ] Extract từng field:
  - [ ] `succeeded bool`
  - [ ] `errors []string` (cast từ `[]interface{}`)
  - [ ] `traceId string` — nếu rỗng → tự generate `trace-{UnixNano}`
  - [ ] `page`, `size`, `count` (cast từ `float64` → `int32`)
  - [ ] `data` object → `json.Marshal(dataObj)` → `dataNguonDuLieu string` (JSON string)
- [ ] Build `model.KhoMoApiResponse` với các field trên

---

### 5. Forward sang dmst-ingest-svc
- [ ] `json.Marshal(payload)` → `[]byte`
- [ ] `POST {INGEST_SERVICE_URL}/api/v1/kho-mo/receive` với `Content-Type: application/json`
- [ ] HTTP Client timeout 30s (không có retry — mock data flow)
- [ ] HTTP != 200 → return lỗi với status code và body
- [ ] HTTP 200 → `json.Unmarshal(respBody, &KhoMoReceiveResponse)`
- [ ] Return `KhoMoForwardResult{Status: "ok", RecordsForwarded: resp.RecordsPublished}`

---

## LUỒNG CHUNG — `POST /api/v1/kho-mo/receive` tại `dmst-ingest-svc`
> Cả 2 luồng trên đều kết thúc tại đây

### 1. HTTP Entry — `KhoMoHandler.Receive()`
- [ ] `io.ReadAll(c.Request.Body)` → raw bytes
- [ ] Body rỗng → `400`
- [ ] `json.Valid(body)` → JSON không hợp lệ → `400`
- [ ] Gọi `KhoMoService.Process(ctx, body)`
- [ ] Lỗi chứa `"schema validation"` → `422 SCHEMA_VALIDATION_FAILED`
- [ ] Lỗi khác → `500`
- [ ] Thành công → `200 + KhoMoProcessResult`

---

### 2. Parse Payload
- [ ] `json.Unmarshal(body, &KhoMoReceivePayload)` → struct với `succeeded`, `errors`, `traceId`, `page`, `size`, `count`, `dataNguonDuLieu`

---

### 3. Schema Validation (feature flag)
- [ ] Nếu `SCHEMA_VALIDATION_ENABLED=false` hoặc `validator == nil` → **bỏ qua**
- [ ] `schemaValidator.Validate(ctx, KhoMoSchemaSubject, payload)`:
  - [ ] Check `sync.Map` cache (lock-free read)
  - [ ] Cache miss → `GET {SCHEMA_REGISTRY_URL}/subjects/{subject}/versions/latest`
    - [ ] HTTP 404 → subject chưa đăng ký, return lỗi rõ ràng
    - [ ] Parse `versionResp.Schema` string → `avro.Parse()` → compile `avro.Schema`
    - [ ] Lưu vào `sync.Map` cache
  - [ ] `json.Unmarshal(data, &map)` → `floatToInt()` (convert `float64` → `int` cho Avro)
  - [ ] `avro.Marshal(schema, convertedPayload)` — dùng marshal roundtrip để validate
  - [ ] Fail → return `"schema validation thất bại: ..."` → handler trả `422`

---

### 4. Save Log (Audit Trail)
- [ ] `json.Marshal(p.Errors)` → `errorsJSON string`
- [ ] `jobRunLogRepo.Create(ctx, &JobRunLog{TraceId, Succeeded, Errors, Page, Size, Count, DataNguonDuLieu})`
- [ ] Insert vào bảng `job_run_logs` — `DataNguonDuLieu` lưu kiểu `jsonb`
- [ ] Lỗi → return lỗi, **dừng pipeline** (không publish Kafka nếu không lưu được log)

---

### 5. Delta Filter — Redis MGET
- [ ] `parseDataItems(p.DataNguonDuLieu)` → `json.Unmarshal` `{"items":[...]}` → `[]KhoMoRawItem`
- [ ] Items rỗng → log warn, return `published=0`
- [ ] `buildRedisKeys(items)` → `["khomo:{id1}", "khomo:{id2}", ...]`
- [ ] `redisClient.MGet(ctx, keys...)` → **1 network call** lấy toàn bộ cached versions
- [ ] `filterDeltaItems()` — phân loại từng item:
  - [ ] `cachedVersion == ""` (item mới) → `pipe.SetNX(key, phienBan)` + thêm vào Kafka messages
  - [ ] `item.PhienBan != cachedVersion` (có thay đổi) → `pipe.Set(key, phienBan)` + thêm vào Kafka messages
  - [ ] `item.PhienBan == cachedVersion` (không đổi) → **bỏ qua**
- [ ] Không có delta → log `"Batch skipped"`, return `published=0`

---

### 6. Produce Kafka (TRƯỚC Redis commit)
- [ ] `buildKafkaMessage(topic, item)`:
  - [ ] `Key = []byte(item.ID)` — đảm bảo ordering, cùng item vào cùng partition
  - [ ] `Value = json.Marshal(item)` — 7 fields của `KhoMoRawItem`
  - [ ] `Topic = KHO_MO_KAFKA_TOPIC` (default: `dmst.kho-mo.raw`)
- [ ] `kafkaWriter.WriteMessages(ctx, msgs...)` — batch publish
- [ ] Lỗi Kafka → **return error ngay**, không commit Redis

---

### 7. Commit Redis (SAU Kafka thành công)
- [ ] `pipe.Exec(ctx)` — thực thi toàn bộ `SetNX` / `Set` trong pipeline
- [ ] Lỗi Redis pipeline → **chỉ log warn**, không return error
  - [ ] At-least-once: item có thể bị re-publish lần scan tiếp theo — chấp nhận được
- [ ] Log `"Batch processed"` với `published`, `skipped`, `traceId`
- [ ] Return `KhoMoProcessResult{Status: "ok", RecordsPublished: len(msgs)}`
