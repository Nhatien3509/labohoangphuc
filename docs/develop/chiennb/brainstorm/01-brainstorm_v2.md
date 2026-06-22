# 🧠 Brainstorm Update: Kong Integration POC - Phiên 2

## Tóm tắt input từ User

| # | Vấn đề | Quyết định / Hướng đi |
|---|--------|-----------------------|
| L40 | External API B: fire-and-forget? | **Không.** Phải retry đến khi thành công. Truyền `route_path` + tham số sinh route. |
| L59 | `route_path` hardcode `v1`/`integration` | Tham số hóa: thêm `version`, `app` vào bảng DB |
| L64 | Có lưu thông tin Kong service tại app? | Cần phân tích trade-off (bên dưới) |
| Mock | Kịch bản mock app nguồn | Gửi message liên tục vào API A qua Kong. Cấu hình body + số lần gửi. |
| L98 | Cấu trúc thư mục Mock | Docker tách biệt. Không ảnh hưởng code chính. |
| L100 | DB migration | Tạo sẵn bằng file `.sql` |

---

## 1. External API B: Retry đảm bảo thành công (L40)

### Thay đổi thiết kế

**Cũ:** Fire & Forget — goroutine gọi xong bỏ.  
**Mới:** **Retry with Backoff** — gọi cho đến khi API B trả về thành công (2xx).

### Cơ chế đề xuất

```
┌──────────────────────────────────────────┐
│ Bước 4: DB Commit thành công             │
│                                          │
│ go notifyExternalAPIB(ctx, payload) ──┐  │
│                                       │  │
│   ┌───────────────────────────┐       │  │
│   │  Retry Loop (max N lần)  │       │  │
│   │  • Exponential Backoff    │       │  │
│   │  • Jitter random          │       │  │
│   │  • POST full route info   │◄──────┘  │
│   │  • Nếu 2xx → Done        │          │
│   │  • Nếu fail → retry      │          │
│   │  • Max fail → log ERROR  │          │
│   └───────────────────────────┘          │
└──────────────────────────────────────────┘
```

### Payload gửi cho API B

Truyền **toàn bộ thông tin route** để API B có thể tự sinh/đăng ký router tương ứng:

```json
{
  "event": "ROUTE_CREATED",
  "api_integration_id": "uuid-xxx",
  "system_code": "ERP",
  "action_code": "SYNC_DATA",
  "version": "v1",
  "app": "integration",
  "route_path": "/api/v1/integration/ERP/SYNC_DATA",
  "upstream_url": "http://mock-a:8081/receive",
  "kong_service_id": "kong-svc-uuid",
  "kong_route_id": "kong-route-uuid",
  "created_at": "2026-04-17T00:00:00+07:00"
}
```

### Cấu hình retry

| Tham số | Giá trị đề xuất POC | Mô tả |
|---------|---------------------|-------|
| `max_retries` | 5 | Số lần gọi lại tối đa |
| `initial_delay` | 1s | Delay ban đầu |
| `max_delay` | 30s | Delay tối đa |
| `backoff_factor` | 2 | Hệ số nhân |
| `timeout_per_call` | 10s | Timeout mỗi request |

### Câu hỏi mở

> [!IMPORTANT]
> Khi retry hết `max_retries` mà API B vẫn fail:
> - **Option 1:** Chỉ log ERROR + đánh `notify_status = FAILED` trong DB → Admin xử lý thủ công.
> - **Option 2:** Đẩy vào Dead Letter Queue (Kafka topic riêng) → Tự retry sau.
> 
> **Đề xuất POC:** Option 1 — đơn giản, đủ cho mục đích demo. Bổ sung cột `notify_status` và `notify_retries` vào bảng `api_integrations`.

---

## 2. Route Path tham số hóa (L59)

### Thay đổi schema bảng `api_integrations`

**Cũ:**
```
route_path = /api/v1/integration/{system_code}/{action_code}   -- hardcode v1, integration
```

**Mới:**
```
route_path = /api/{version}/{app}/{system_code}/{action_code}  -- dynamic
```

### Cột bổ sung

| Trường | Kiểu | Default | Mô tả |
|--------|------|---------|-------|
| `version` | VARCHAR(10) | `v1` | Phiên bản API (v1, v2, ...) |
| `app` | VARCHAR(50) | `integration` | Tên ứng dụng/module (integration, webhook, sync, ...) |

### Lợi ích

1. **Multi-version:** Cùng `system_code` + `action_code` nhưng chạy version khác → route khác nhau, upstream khác nhau.
2. **Multi-app:** Một hệ thống nguồn có thể phục vụ nhiều module (integration, reporting, sync...).
3. **Route path tự sinh:** `route_path = fmt.Sprintf("/api/%s/%s/%s/%s", version, app, systemCode, actionCode)`.

### Schema cập nhật đầy đủ

```sql
CREATE TABLE api_integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code     VARCHAR(50)  NOT NULL,
    action_code     VARCHAR(100) NOT NULL,
    version         VARCHAR(10)  NOT NULL DEFAULT 'v1',
    app             VARCHAR(50)  NOT NULL DEFAULT 'integration',
    upstream_url    VARCHAR(500) NOT NULL,
    route_path      VARCHAR(500) NOT NULL,  -- auto-generated
    kong_service_id UUID,
    kong_route_id   UUID,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notify_status   VARCHAR(20)  DEFAULT 'NONE',  -- NONE, SENT, FAILED
    notify_retries  INT          DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    
    UNIQUE(version, app, system_code, action_code)
);
```

---

## 3. Lưu thông tin Kong Service tại App Server? (L64)

### 🧠 Brainstorm: Lưu vs. Không lưu

### Option A: Lưu tại App (Hiện tại đang đề xuất)

**Lý do NÊN lưu:**

✅ **Pros:**
- **Tham chiếu nhanh:** Update/Delete route trên Kong chỉ cần query DB local → lấy `kong_service_id` → gọi Kong Admin API. Không cần list toàn bộ Kong services.
- **Audit trail:** Biết chính xác route nào do app tạo, khi nào tạo, ai tạo.
- **Trạng thái nghiệp vụ:** Quản lý `status` (PENDING/ACTIVE/INACTIVE/FAILED) → UI quản trị hiển thị rõ ràng.
- **Rollback logic:** Cần `kong_service_id` + `kong_route_id` để gọi DELETE API Kong khi compensate.
- **Offline reference:** Khi Kong admin API không khả dụng tạm thời, app vẫn biết cấu hình hiện tại.

❌ **Cons:**
- **Drift risk:** Nếu ai đó sửa Kong trực tiếp (qua Konga/Admin API) → DB app lệch với thực tế Kong.
- **Duplicated state:** Phải sync 2 nơi.

### Option B: Không lưu — Query Kong mỗi lần cần

✅ **Pros:**
- Single source of truth (Kong là master).
- Không lo drift.

❌ **Cons:**
- **Performance:** Mỗi thao tác cần gọi Kong Admin API list/search → chậm.
- **Thiếu nghiệp vụ:** Kong không lưu `system_code`, `action_code`, `status` nghiệp vụ.
- **Không rollback được:** Không biết ID để xóa khi compensate.

### 💡 Đề xuất: **Lưu (Option A)** + Cơ chế Sync

**Lý do quyết định:** Trong bài toán này, app **sở hữu nghiệp vụ** (system_code, action_code, status), Kong **sở hữu routing**. Hai nguồn thông tin khác nhau → phải lưu cả hai. Thêm cơ chế reconcile định kỳ nếu cần.

---

### Version cấu hình & Rollback

> [!IMPORTANT]
> Bài toán: Khi cần rollback cấu hình (ví dụ: đổi upstream_url, đổi route_path), quay về phiên bản cũ thế nào?

### Option A: Bảng History (Đề xuất)

Tạo bảng `api_integration_history` lưu snapshot mỗi lần thay đổi:

```sql
CREATE TABLE api_integration_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_integration_id  UUID NOT NULL REFERENCES api_integrations(id),
    config_version      INT  NOT NULL,          -- 1, 2, 3...
    upstream_url        VARCHAR(500) NOT NULL,
    route_path          VARCHAR(500) NOT NULL,
    kong_service_id     UUID,
    kong_route_id       UUID,
    change_type         VARCHAR(20) NOT NULL,   -- CREATE, UPDATE, ROLLBACK
    changed_by          VARCHAR(100),
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    snapshot_data       JSONB                   -- full config snapshot
);
```

**Quy trình rollback:**
1. Query `api_integration_history` WHERE `api_integration_id = X` ORDER BY `config_version` DESC.
2. Lấy version muốn rollback.
3. Gọi Kong Admin API update Service/Route theo snapshot cũ.
4. Update bảng `api_integrations` với giá trị cũ.
5. Insert thêm 1 record vào history với `change_type = ROLLBACK`.

✅ **Pros:** Đơn giản, dễ query, có thể rollback về bất kỳ version nào.  
❌ **Cons:** Dữ liệu history tăng theo thời gian (chấp nhận được).

📊 **Effort:** Low — thêm 1 bảng + logic insert khi update.

### Option B: Event Sourcing

Lưu mọi thay đổi dưới dạng event, rebuild state bằng cách replay.

✅ **Pros:** Mạnh mẽ, không mất thông tin.  
❌ **Cons:** Overkill cho POC. Phức tạp rebuild state.

📊 **Effort:** High.

### 💡 Đề xuất: **Option A** — Bảng History đơn giản. Phù hợp POC, dễ mở rộng sau.

---

## 4. Kịch bản Mock App Nguồn (POC)

### Mục đích
Mock một **app nguồn** (bên ngoài hệ thống) gửi message liên tục vào API đã được khai báo qua Kong, để kiểm chứng luồng end-to-end.

### Thiết kế Mock Source App

```
┌─────────────────────────────────┐
│     Mock Source App (Docker)     │
│                                  │
│  Config (ENV):                   │
│  • TARGET_URL: kong-gateway/...  │
│  • TOTAL_MESSAGES: 100           │
│  • INTERVAL_MS: 500             │
│  • BODY_TEMPLATE: {...}          │
│                                  │
│  Loop i = 1..TOTAL_MESSAGES:     │
│    body = {                      │
│      ...BODY_TEMPLATE,           │
│      "seq": i,                   │
│      "timestamp": time.Now(),    │
│      "trace_id": uuid.New(),     │
│      "payload": randomData()     │
│    }                             │
│    POST TARGET_URL body          │
│    sleep(INTERVAL_MS)            │
│  EndLoop                         │
└─────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│      Kong Gateway (:8000)        │
│  Route: /api/v1/integration/...  │
│          │                       │
│          ▼                       │
│    Upstream → Mock API A         │
└─────────────────────────────────┘
```

### Cấu hình qua ENV hoặc API call

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `TARGET_URL` | URL đầy đủ qua Kong Gateway | `http://kong:8000/api/v1/integration/ERP/SYNC_DATA` |
| `TOTAL_MESSAGES` | Số message gửi | `100` |
| `INTERVAL_MS` | Khoảng cách giữa các message (ms) | `500` |
| `BODY_TEMPLATE` | Template JSON body cơ bản | `{"source": "ERP", "type": "order"}` |

### Body message tự sinh (auto-enrich)

```json
{
  "source": "ERP",
  "type": "order",
  "seq": 42,
  "trace_id": "a3f1b2c4-...",
  "timestamp": "2026-04-17T00:05:30.123+07:00",
  "payload": {
    "order_id": "ORD-20260417-042",
    "amount": 1250000,
    "customer": "CUST-RND-7891"
  }
}
```

Mỗi message khác nhau nhờ: `seq` tăng dần, `trace_id` UUID random, `timestamp` thời điểm thực, `payload` dữ liệu random.

---

## 5. Cấu trúc thư mục Docker tách biệt (L98)

### Nguyên tắc

1. **Mock A, Mock B, Source App, Config API** → mỗi cái là một Docker container riêng.
2. **Không ảnh hưởng code Go chính** (`adm-srv-go-api`).
3. **Tuân thủ Go project layout** chuẩn.

### Đề xuất cấu trúc

```
26.dmst.c12.tichhopchiase/
├── docs/
│   └── kong/
│       ├── brainstorm.md
│       └── ...
│
├── srcs/
│   ├── adm-srv-go-api/          ← Code Go chính (KHÔNG ĐỤNG VÀO)
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── ...
│   │
│   └── poc-kong-integration/     ← ★ THƯ MỤC POC MỚI (tách biệt hoàn toàn)
│       │
│       ├── docker-compose.yml    ← Orchestrate toàn bộ stack POC
│       ├── .env.example
│       ├── README.md
│       │
│       ├── mock-api-a/           ← Mock API A (nhận data cuối)
│       │   ├── Dockerfile
│       │   ├── main.go           ← Standalone Go binary đơn giản
│       │   └── go.mod
│       │
│       ├── mock-api-b/           ← Mock API B (webhook receiver)
│       │   ├── Dockerfile
│       │   ├── main.go
│       │   └── go.mod
│       │
│       ├── mock-source/          ← App nguồn gửi message
│       │   ├── Dockerfile
│       │   ├── main.go
│       │   └── go.mod
│       │
│       ├── config-api/           ← API cấu hình Kong (Go chính - copy/symlink)
│       │   ├── Dockerfile
│       │   ├── main.go           ← Import từ adm-srv-go-api hoặc standalone
│       │   └── go.mod
│       │
│       └── db/
│           └── init.sql          ← Schema SQL tạo sẵn bảng
```

### Docker Compose Stack

```yaml
# poc-kong-integration/docker-compose.yml
services:
  # --- Infrastructure ---
  postgres:
    image: postgres:16-alpine
    volumes:
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_DB: kong_poc
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: poc123

  kong-database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kong
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: kongpass

  kong-migration:
    image: kong/kong-gateway:3.9
    command: kong migrations bootstrap
    depends_on: [kong-database]
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database

  kong:
    image: kong/kong-gateway:3.9
    depends_on: [kong-migration]
    ports:
      - "8000:8000"   # proxy
      - "8001:8001"   # admin API
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database

  # --- Application ---
  config-api:
    build: ./config-api
    ports:
      - "8080:8080"
    depends_on: [postgres, kong]
    environment:
      DB_HOST: postgres
      KONG_ADMIN_URL: http://kong:8001

  # --- Mocks ---
  mock-api-a:
    build: ./mock-api-a
    ports:
      - "8081:8081"

  mock-api-b:
    build: ./mock-api-b
    ports:
      - "8082:8082"

  mock-source:
    build: ./mock-source
    depends_on: [kong, config-api]
    environment:
      TARGET_URL: http://kong:8000/api/v1/integration/ERP/SYNC_DATA
      TOTAL_MESSAGES: 50
      INTERVAL_MS: 500
```

### Lý do thiết kế

| Quyết định | Lý do |
|------------|-------|
| Tách thư mục `poc-kong-integration` | Khi merge code, chỉ cần ignore hoặc xóa folder này. Không ảnh hưởng `adm-srv-go-api`. |
| Mỗi mock là Go module độc lập | `go.mod` riêng → không gây conflict dependency. |
| `config-api` tách riêng | Có thể import package từ `adm-srv-go-api` qua `replace` directive, hoặc viết standalone cho POC. |
| `db/init.sql` tạo sẵn | Theo quyết định L100: dùng file SQL, không dùng GORM AutoMigrate. |
| 2 PostgreSQL instances | 1 cho app data, 1 cho Kong — đúng kiến trúc production. |

---

## 6. Database Migration: File SQL (L100)

### Quyết định: Dùng file `.sql` tạo sẵn

File `db/init.sql` chứa schema đầy đủ, được mount vào PostgreSQL container qua `docker-entrypoint-initdb.d/`.

### Lợi ích so với GORM AutoMigrate

| File SQL | GORM AutoMigrate |
|----------|-----------------|
| ✅ Kiểm soát 100% schema | ❌ Schema phụ thuộc code |
| ✅ DBA review được | ❌ Khó review |
| ✅ Reproducible | ❌ Có thể khác giữa các lần |
| ✅ Version control rõ ràng | ❌ Schema ẩn trong struct |
| ❌ Phải viết tay migration | ✅ Tự động |

---

## 7. Tổng kết thay đổi so với Brainstorm v1

```diff
 ### 3.1. Luồng chạy tối ưu
  4. [DB - Tx Commit] COMMIT.
- 5. [External API] Fire & Forget
+ 5. [External API] Retry with Backoff (max 5 lần, exponential)
+    Payload: toàn bộ route_path + tham số sinh route
+    Ghi nhận notify_status vào DB

 ### 4.1 Bảng api_integrations
- route_path: /api/v1/integration/{system_code}/{action_code}
+ route_path: /api/{version}/{app}/{system_code}/{action_code}
+ version: VARCHAR(10) DEFAULT 'v1'          -- MỚI
+ app: VARCHAR(50) DEFAULT 'integration'     -- MỚI
+ notify_status: VARCHAR(20) DEFAULT 'NONE'  -- MỚI
+ notify_retries: INT DEFAULT 0              -- MỚI

+ ### Bảng mới: api_integration_history
+ Lưu snapshot cấu hình mỗi lần thay đổi, phục vụ rollback

 ### Mock và POC
+ Thêm mock-source app: gửi message liên tục
+ Cấu trúc: poc-kong-integration/ tách biệt khỏi adm-srv-go-api
+ DB migration: file init.sql tạo sẵn
```

---

## Câu hỏi mở còn lại

> [!IMPORTANT]
> 1. **Retry fail hết → Option 1 (log ERROR) hay Option 2 (Dead Letter Queue)?**
> 2. **`config-api` trong POC:** Viết standalone (copy logic cần thiết) hay dùng `go.mod replace` để import từ `adm-srv-go-api`?
> 3. **Kong Strip Path (L99):** Mock API A muốn nhận path gốc `/receive` (strip_path=true) hay path đầy đủ `/api/v1/integration/ERP/SYNC_DATA` (strip_path=false)?
> 4. **Bảng history:** Có muốn đưa vào POC ngay không, hay để phase sau?
