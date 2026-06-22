# 🧠 Brainstorm Update: Kong Integration POC - Phiên 2 (Đã chốt)

## Tóm tắt quyết định

| # | Vấn đề | Quyết định |
|---|--------|------------|
| L40 | mock-kafka-config: fire-and-forget? | **Retry with Backoff.** Truyền `route_path` + tham số sinh route. Fail hết → log ERROR. |
| L59 | `route_path` hardcode `v1`/`integration` | Tham số hóa: thêm `version`, `app` vào bảng DB |
| L64 | Lưu thông tin Kong service tại app? | **Có.** Lưu tại app (Option A) + cơ chế reconcile |
| L86 | Tên bảng `api_integrations`? | **Đổi → `kong_route_configs`** — phù hợp quản lý tập trung đa dự án |
| L177 | Version cấu hình & Rollback | **Option A:** Bảng History — đưa vào POC ngay |
| Mock | Kịch bản mock app nguồn | Gửi message liên tục vào API qua Kong. Cấu hình body + số lần gửi. |
| L98 | Cấu trúc thư mục Mock | Docker tách biệt: `mock-api-dest`, `mock-kafka-config`, `mock-source` |
| L99 | Kong Strip Path | **`strip_path = false`** — Upstream nhận path đầy đủ |
| L100 | DB migration | Tạo sẵn bằng file `.sql` |
| Config | config-api | **Standalone** — không dùng `go.mod replace` |

---

## 1. mock-kafka-config: Retry đảm bảo thành công (L40)

### Thay đổi thiết kế

**Cũ:** Fire & Forget — goroutine gọi xong bỏ.  
**Mới:** **Retry with Backoff** — gọi cho đến khi API B trả về thành công (2xx).

### Cơ chế đề xuất

```
┌──────────────────────────────────────────┐
│ Bước 4: DB Commit thành công             │
│                                          │
│ go notifyKafkaConfig(ctx, payload) ───┐  │
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

### Payload gửi cho mock-kafka-config

Truyền **toàn bộ thông tin route** để mock-kafka-config có thể tự sinh/đăng ký router tương ứng:

```json
{
  "event": "ROUTE_CREATED",
  "api_integration_id": "uuid-xxx",
  "system_code": "ERP",
  "action_code": "SYNC_DATA",
  "version": "v1",
  "app": "integration",
  "route_path": "/api/v1/integration/ERP/SYNC_DATA",
  "upstream_url": "http://mock-api-dest:8081/receive",
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

### ✅ Quyết định: Option 1 — Log ERROR

Khi retry hết `max_retries` mà mock-kafka-config vẫn fail:
- Log ERROR + đánh `notify_status = FAILED` trong DB → Admin xử lý thủ công.
- Bổ sung cột `notify_status` và `notify_retries` vào bảng `kong_route_configs`.

---

## 2. Route Path tham số hóa (L59)

### Đổi tên bảng: `api_integrations` → `kong_route_configs`

> **Lý do đổi tên:** Bảng này phục vụ **quản lý tập trung cấu hình Kong** cho nhiều dự án khác nhau, không chỉ riêng "integration". Tên `api_integrations` gợi ý bảng chỉ dùng cho tích hợp API — quá hẹp so với scope thực tế.
>
> | Tên cũ | Vấn đề | Tên mới | Ý nghĩa |
> |--------|--------|---------|----------|
> | `api_integrations` | Gợi ý chỉ dùng cho integration | `kong_route_configs` | Rõ ràng: đây là cấu hình route trên Kong |
>
> Các tên thay thế đã cân nhắc:
> - `kong_configs` — quá chung, Kong có nhiều loại config (plugins, consumers...)
> - `kong_services` — trùng khái niệm Service trong Kong
> - `kong_route_configs` ✅ — chính xác: quản lý cấu hình route, phục vụ đa dự án

### Thay đổi schema bảng `kong_route_configs`

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
CREATE TABLE kong_route_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code     VARCHAR(50)  NOT NULL,
    action_code     VARCHAR(100) NOT NULL,
    version         VARCHAR(10)  NOT NULL DEFAULT 'v1',
    app             VARCHAR(50)  NOT NULL DEFAULT 'integration',
    upstream_url    VARCHAR(500) NOT NULL,
    route_path      VARCHAR(500) NOT NULL,  -- auto-generated
    kong_service_id UUID,
    kong_route_id   UUID,
    strip_path      BOOLEAN      NOT NULL DEFAULT FALSE,
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

### ✅ Quyết định: **Lưu (Option A)** + Cơ chế Sync

**Lý do:** App **sở hữu nghiệp vụ** (system_code, action_code, status), Kong **sở hữu routing**. Hai nguồn thông tin khác nhau → phải lưu cả hai. Thêm cơ chế reconcile định kỳ nếu cần.

---

### Version cấu hình & Rollback

> [!IMPORTANT]
> Bài toán: Khi cần rollback cấu hình (ví dụ: đổi upstream_url, đổi route_path), quay về phiên bản cũ thế nào?

### ✅ Quyết định: Option A — Bảng History (Đưa vào POC ngay)

Tạo bảng `kong_route_config_history` lưu snapshot mỗi lần thay đổi:

```sql
CREATE TABLE kong_route_config_history (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kong_route_config_id    UUID NOT NULL REFERENCES kong_route_configs(id),
    config_version          INT  NOT NULL,          -- 1, 2, 3...
    upstream_url            VARCHAR(500) NOT NULL,
    route_path              VARCHAR(500) NOT NULL,
    kong_service_id         UUID,
    kong_route_id           UUID,
    change_type             VARCHAR(20) NOT NULL,   -- CREATE, UPDATE, ROLLBACK
    changed_by              VARCHAR(100),
    changed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    snapshot_data           JSONB                   -- full config snapshot
);
```

**Quy trình rollback:**
1. Query `kong_route_config_history` WHERE `kong_route_config_id = X` ORDER BY `config_version` DESC.
2. Lấy version muốn rollback.
3. Gọi Kong Admin API update Service/Route theo snapshot cũ.
4. Update bảng `kong_route_configs` với giá trị cũ.
5. Insert thêm 1 record vào history với `change_type = ROLLBACK`.

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
│    Upstream → mock-api-dest      │
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

1. **mock-api-dest, mock-kafka-config, mock-source, config-api** → mỗi cái là một Docker container riêng.
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
│       ├── mock-api-dest/        ← API đích nhận data cuối (upstream)
│       │   ├── Dockerfile
│       │   ├── main.go           ← Standalone Go binary đơn giản
│       │   └── go.mod
│       │
│       ├── mock-kafka-config/    ← Nhận notify cấu hình route mới
│       │   ├── Dockerfile
│       │   ├── main.go
│       │   └── go.mod
│       │
│       ├── mock-source/          ← App nguồn gửi message
│       │   ├── Dockerfile
│       │   ├── main.go
│       │   └── go.mod
│       │
│       ├── config-api/           ← API cấu hình Kong (standalone)
│       │   ├── Dockerfile
│       │   ├── main.go           ← Standalone, không import từ adm-srv-go-api
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
  mock-api-dest:
    build: ./mock-api-dest
    ports:
      - "8081:8081"

  mock-kafka-config:
    build: ./mock-kafka-config
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
| `config-api` standalone | Viết standalone, không phụ thuộc `adm-srv-go-api`. Đơn giản cho POC. |
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
+ 5. [mock-kafka-config] Retry with Backoff (max 5 lần, exponential)
+    Payload: toàn bộ route_path + tham số sinh route
+    Ghi nhận notify_status vào DB
+    Fail hết → log ERROR (Option 1)

- ### 4.1 Bảng api_integrations
+ ### 4.1 Bảng kong_route_configs (đổi tên)
- route_path: /api/v1/integration/{system_code}/{action_code}
+ route_path: /api/{version}/{app}/{system_code}/{action_code}
+ version: VARCHAR(10) DEFAULT 'v1'
+ app: VARCHAR(50) DEFAULT 'integration'
+ strip_path: BOOLEAN DEFAULT FALSE
+ notify_status: VARCHAR(20) DEFAULT 'NONE'
+ notify_retries: INT DEFAULT 0

+ ### Bảng mới: kong_route_config_history (đưa vào POC)
+ Lưu snapshot cấu hình mỗi lần thay đổi, phục vụ rollback

 ### Mock và POC (đổi tên components)
- mock-api-a → mock-api-dest
- mock-api-b → mock-kafka-config
+ config-api: standalone (không dùng go.mod replace)
+ strip_path = false
+ DB migration: file init.sql tạo sẵn
```

---

## ✅ Tất cả câu hỏi đã được chốt

| # | Câu hỏi | Quyết định |
|---|---------|------------|
| 1 | Retry fail hết | **Option 1:** Log ERROR, admin xử lý thủ công |
| 2 | config-api import | **Standalone** — không dùng `go.mod replace` |
| 3 | Kong Strip Path | **`strip_path = false`** — Upstream nhận path đầy đủ |
| 4 | Bảng history | **Có** — đưa vào POC ngay |
| 5 | Tên bảng chính | **`kong_route_configs`** — phù hợp quản lý tập trung đa dự án |
