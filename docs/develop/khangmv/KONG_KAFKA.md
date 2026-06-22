# Plan: audit-svc (Go Microservice)

## Context

Hệ thống DMST là một microservice architecture gồm nhiều services (admin-svc, integration-svc, ...). audit-svc là một service độc lập ngang hàng, viết bằng Go.

**Nhiệm vụ của audit-svc:**
1. Chạy nền một Kafka consumer, consume topic `dmst_audit`
2. Parse message từ Kong kafka-log plugin
3. Ghi vào bảng `audit_access_logs` trong Postgres
4. Expose REST API để query `audit_access_logs`

---

## Kafka Message Format (từ Kong kafka-log plugin)

Đây là format message mà audit-svc sẽ nhận từ topic `dmst_audit`:

```json
{
  "requestId": "b18f8a653ff0867866d19d6afc790f4a",
  "route": "admin-svc-route",
  "service": "admin-svc",
  "uri": "/api/v1/pull-jobs/TTDLQG/run",
  "eventClass": "200",
  "receivedTime": 1779521843501,
  "request": {
    "method": "POST",
    "in": 83,
    "out": 359
  },
  "latency": {
    "proxy": 9,
    "kong": 1,
    "total": 10
  },
  "sourceUser": {
    "name": "consumer-name"
  },
  "application": {
    "askId": "dmst-gateway",
    "name": "dmst-kong"
  }
}
```

**Lưu ý:**
- `requestId` = `X-Kong-Request-Id` — đây là trace_id
- `eventClass` = HTTP status code (dạng string, VD: "200", "404")
- `receivedTime` = Unix timestamp milliseconds
- `sourceUser.name` = Kong consumer username (nullable)
- `latency.proxy` = upstream latency ms
- `latency.total` = tổng latency ms

---

## Database Schema

Bảng cần tạo trong Postgres (dùng GORM AutoMigrate):

```sql
CREATE TABLE audit_access_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   VARCHAR(64),
  consumer     VARCHAR(255),
  route        VARCHAR(255),
  service      VARCHAR(255),
  method       VARCHAR(16),
  uri          VARCHAR(1024),
  status_code  INTEGER,
  latency_ms   INTEGER,
  received_at  TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_logs_request_id ON audit_access_logs(request_id);
CREATE INDEX idx_access_logs_received_at ON audit_access_logs(received_at DESC);
CREATE INDEX idx_access_logs_status_code ON audit_access_logs(status_code, received_at DESC);
CREATE INDEX idx_access_logs_route ON audit_access_logs(route, received_at DESC);
```

---

## Cấu trúc project

```
audit-svc/
├── cmd/
│   └── main.go                  ← Entry point: init DB, start consumer, start HTTP server
├── internal/
│   ├── config/
│   │   └── config.go            ← Load env vars
│   ├── consumer/
│   │   └── kafka_consumer.go    ← Kafka consumer group, parse message, gọi service
│   ├── handler/
│   │   └── access_log_handler.go ← HTTP handlers cho REST API
│   ├── model/
│   │   └── access_log.go        ← GORM model
│   ├── repository/
│   │   └── access_log_repo.go   ← DB operations
│   └── service/
│       └── access_log_service.go ← Business logic
├── go.mod
└── go.sum
```

---

## Config (Environment Variables)

```go
type Config struct {
    // Server
    AppPort string // APP_PORT, default "8083"

    // Postgres
    DBHost string // DB_HOST
    DBPort string // DB_PORT, default "5432"
    DBUser string // DB_USER
    DBPass string // DB_PASS
    DBName string // DB_NAME

    // Kafka
    KafkaBrokers string // KAFKA_BROKERS, comma-separated, VD: "host1:9092,host2:9092"
    KafkaTopic   string // KAFKA_TOPIC, default "dmst_audit"
    KafkaGroupID string // KAFKA_GROUP_ID, default "audit-svc-group"
}
```

---

## Logic Kafka Consumer

```
Start consumer group với group ID "audit-svc-group"
Loop:
  Nhận message từ topic dmst_audit
  Parse JSON → KongAuditMessage struct
  Map fields → AccessLog model:
    request_id  = message.requestId
    consumer    = message.sourceUser.name
    route       = message.route
    service     = message.service
    method      = message.request.method
    uri         = message.uri
    status_code = parseInt(message.eventClass)
    latency_ms  = message.latency.total
    received_at = time.UnixMilli(message.receivedTime)
  INSERT vào audit_access_logs
  Mark message offset committed
  Log: "[audit-svc] Logged: METHOD URI STATUS (Xms) trace=REQUEST_ID"
```

**Error handling:**
- Parse lỗi → log warn + skip message (không crash)
- DB insert lỗi → log error + skip (không crash)
- Kafka connection lỗi → retry với backoff

---

## REST API Endpoints

### GET /health
Health check đơn giản.

**Response:**
```json
{"status": "ok"}
```

---

### POST /api/v1/access-logs/search

Search + pagination access logs.

**Request body:**
```json
{
  "filters": {
    "request_id": "b18f8a653ff0867866d19d6afc790f4a",
    "route": "admin-svc-route",
    "method": "POST",
    "status_code": 200,
    "start_time": "2026-05-23T00:00:00Z",
    "end_time": "2026-05-23T23:59:59Z"
  },
  "pagination": {
    "page": 1,
    "page_size": 50
  },
  "sort": {
    "field": "received_at",
    "order": "desc"
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "request_id": "b18f8a653ff0867866d19d6afc790f4a",
      "consumer": "admin-consumer",
      "route": "admin-svc-route",
      "service": "admin-svc",
      "method": "POST",
      "uri": "/api/v1/pull-jobs/TTDLQG/run",
      "status_code": 200,
      "latency_ms": 10,
      "received_at": "2026-05-23T07:57:17Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 50,
    "total_pages": 2
  }
}
```

---

### GET /api/v1/access-logs/trace/:request_id

Lấy tất cả logs của 1 request_id (trace lookup).

**Response:**
```json
{
  "request_id": "b18f8a653ff0867866d19d6afc790f4a",
  "total": 1,
  "logs": [...]
}
```

---

### GET /api/v1/access-logs/stats

Thống kê nhanh: total requests, error rate, avg latency trong 24h.

**Query params:** `hours=24`

**Response:**
```json
{
  "period_hours": 24,
  "total_requests": 1042,
  "error_requests": 23,
  "error_rate": 2.2,
  "avg_latency_ms": 45,
  "p95_latency_ms": 120
}
```

---

## Dependencies (go.mod)

```
github.com/gin-gonic/gin
github.com/IBM/sarama          ← Kafka client
gorm.io/gorm
gorm.io/driver/postgres
github.com/google/uuid
github.com/joho/godotenv       ← Load .env (optional)
```

---

## main.go Logic

```
1. Load config từ env
2. Connect Postgres (GORM)
3. AutoMigrate AccessLog model
4. Init repository + service + handler
5. Start Kafka consumer trong goroutine (chạy nền)
6. Start Gin HTTP server (blocking)
7. Graceful shutdown: nhận SIGINT/SIGTERM → stop consumer + stop server
```

---

## Kết quả mong đợi

Sau khi chạy audit-svc:

1. Mọi request đi qua Kong → Kong produce vào `dmst_audit` → audit-svc consume → ghi vào `audit_access_logs`
2. Query logs qua REST API: `POST /api/v1/access-logs/search`
3. Trace lookup: `GET /api/v1/access-logs/trace/:request_id`
4. Stats dashboard: `GET /api/v1/access-logs/stats`

**Test nhanh:**
```bash
# Gửi request qua Kong
curl http://localhost:8000/api/v1/health

# Chờ ~1 giây, query audit-svc
curl -X POST http://localhost:8083/api/v1/access-logs/search \
  -H "Content-Type: application/json" \
  -d '{"pagination": {"page": 1, "page_size": 10}}'

# Expected: thấy log của request vừa gửi
```