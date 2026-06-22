# PLAN: Kho Mở Delta Filter (Redis Version Cache)

## Mô tả

Tích hợp Redis vào `kho_mo_service.go` để lọc delta dựa trên `item.phienBan`.
Thay vì đẩy toàn bộ ~10M bản ghi lên Kafka mỗi lần quét, chỉ publish các bản ghi
**mới xuất hiện** hoặc **đã thay đổi phiên bản**.

---

## ✅ Đánh giá Plan gốc

| Điểm | Đánh giá |
|------|---------|
| Redis MGET cho cả batch | ✅ Tối ưu — 1 round-trip duy nhất |
| Kafka produce TRƯỚC, Redis SET SAU | ✅ Đúng thứ tự — tránh mất message |
| `kafka.Hash{}` + `item.id` làm Key | ✅ Đúng — đảm bảo ordering theo item |
| Redis Pipeline cho batch SET | ✅ Tối ưu — giảm N round-trip xuống 1 |
| TTL = 0 (không hết hạn) | ✅ Phù hợp vì version là state dài hạn |

---

## ⚠️ Điểm cần bổ sung / Điều chỉnh

### 1. At-Least-Once Duplicate Risk (Chấp nhận được nhưng cần ghi chú)

**Tình huống:** Service crash sau khi Kafka produce thành công nhưng TRƯỚC khi `redisPipeline.Exec()` chạy.
- **Kết quả:** Khi restart, Redis vẫn chưa có version → item bị gửi lại lên Kafka **(duplicate)**.
- **Quyết định:** Đây là trade-off At-Least-Once chấp nhận được với hệ thống stream processing.
- **Yêu cầu:** Consumer phía downstream cần **idempotent** (xử lý được duplicate theo `item.id`).

> [!IMPORTANT]
> Plan cần ghi chú rõ ràng về at-least-once semantics này để Consumer team biết handle duplicate.

### 2. Race Condition khi nhiều Worker song song (Cần xử lý)

**Tình huống:** 2 goroutine worker cùng xử lý batch chứa cùng `item.id` (ví dụ item xuất hiện ở cả page 5 và page 6 do paging không ổn định).
- **Cả 2 đều MGET → cùng thấy `""` → cả 2 đều produce → duplicate trên Kafka**.
- **Giải pháp:** Dùng Redis `SET NX` (Set if Not Exists) thay vì `SET` thông thường trong pipeline, hoặc dùng `SET key value XX` kết hợp với `GET` (atomic compare). Thực tế với `TTL=0` ta có thể dùng:
  ```
  SET khomo:{item.id} {phienBan} NX   // chỉ set nếu chưa có (item mới)
  SET khomo:{item.id} {phienBan} XX   // chỉ update nếu đã tồn tại (item cập nhật)
  ```
  Hoặc đơn giản hơn: dùng **Lua Script** atomic `GET + compare + SET`.

> [!WARNING]
> Nếu BatchSize nhỏ và item chỉ xuất hiện 1 lần/page thì race condition này ít xảy ra.
> Tuy nhiên cần xác nhận với bạn: **Worker có chạy song song (multiple goroutine) không?**
> Nếu **sequential** (1 goroutine duy nhất) thì không cần xử lý.

### 3. Avro Envelope vs JSON (Cần làm rõ)

Plan gốc đề cập **"Map dữ liệu thành Avro Event"**. Nhưng hiện tại codebase đang dùng `json.Marshal(item)` — không có Avro binary encoding.

> [!IMPORTANT]
> **Câu hỏi cần xác nhận:** Kafka message Value sẽ là:
> - **JSON bytes** (hiện tại) — đơn giản, Consumer dễ debug
> - **Avro binary** — cần Schema Registry encode/decode, nhưng đúng chuẩn Schema đã đăng ký

Tôi đề xuất **giữ JSON** cho phase này, vì Avro binary encoding cần Confluent wire format (magic byte + schema ID) và thêm dependency mới. Schema Validation đã chạy ở bước trước là đủ để đảm bảo data quality.

---

## 📁 Proposed Changes

### Dependency mới

```bash
go get github.com/redis/go-redis/v9
```

### Files thay đổi

| File | Thay đổi |
|------|---------|
| `internal/config/config.go` | **[MODIFY]** Thêm `RedisAddr`, `RedisPassword`, `RedisDB` |
| `internal/service/kho_mo_delta.go` | **[NEW]** `KhoMoDeltaFilter` service với `processBatch()` |
| `internal/service/kho_mo_service.go` | **[MODIFY]** Inject `KhoMoDeltaFilter`, gọi `processBatch()` thay vì `buildKafkaMessages()` |
| `cmd/ingest/main.go` | **[MODIFY]** Init Redis client, wire `KhoMoDeltaFilter` |
| `.env` | **[MODIFY]** Thêm `REDIS_ADDR`, `REDIS_PASSWORD`, `REDIS_DB` |

---

### `internal/service/kho_mo_delta.go` — Hàm `processBatch` chi tiết

```go
// processBatch nhận 1 batch items, lọc delta qua Redis MGET,
// produce item mới/thay đổi lên Kafka, SAU ĐÓ mới commit version vào Redis Pipeline.
func (s *khoMoDeltaFilter) processBatch(ctx context.Context, traceId string, items []model.KhoMoRawItem) (int, error) {
    // Bước 1: Build Redis keys
    keys := buildRedisKeys(items)          // "khomo:{item.id}"

    // Bước 2: MGET — 1 network call
    versions, err := s.redis.MGet(ctx, keys...).Result()

    // Bước 3: Filter & phân loại
    var messagesToKafka []kafka.Message
    pipe := s.redis.Pipeline()
    for i, item := range items {
        redisVersion, _ := versions[i].(string)
        if redisVersion == "" || item.PhienBan != redisVersion {
            // Mới hoặc có cập nhật → produce
            msg := buildKafkaMessage(s.topic, traceId, item)
            messagesToKafka = append(messagesToKafka, msg)
            pipe.Set(ctx, keys[i], item.PhienBan, 0) // TTL=0
        }
        // Else: skip (same version)
    }

    if len(messagesToKafka) == 0 {
        return 0, nil
    }

    // Bước 4.1: Produce Kafka TRƯỚC
    if err := s.kafkaWriter.WriteMessages(ctx, messagesToKafka...); err != nil {
        return 0, fmt.Errorf("kafka produce failed: %w", err)
    }

    // Bước 4.2: CHỈ commit Redis SAU KHI Kafka thành công
    if _, err := pipe.Exec(ctx); err != nil {
        // Log warning nhưng không return error — Kafka đã nhận được
        // Worst case: at-least-once duplicate ở lần scan tiếp theo
        s.log.Warn("redis pipeline exec failed after kafka success", zap.Error(err))
    }

    return len(messagesToKafka), nil
}
```

---

## ✅ Verification Checklist

1. **Redis MGET test**: Gửi 10 items lần 1 → tất cả 10 message vào Kafka. Gửi lại lần 2 (không thay đổi phienBan) → 0 message vào Kafka.
2. **Delta test**: Đổi `phienBan` của 3 item → gửi lại → đúng 3 message vào Kafka.
3. **Kafka failure test**: Mock kafka write lỗi → Redis KHÔNG được update (kiểm tra Redis keys vẫn giữ version cũ).
4. **Build pass**: `go build ./...` thành công.

---

## Câu hỏi cần xác nhận trước khi triển khai

> [!IMPORTANT]
> 1. **Worker chạy sequential hay parallel?** Nếu parallel cần thêm cơ chế tránh race condition.
> 2. **Kafka Value format:** JSON hay Avro binary?
> 3. **Redis server:** IP/port của Redis instance trong hệ thống là gì?
