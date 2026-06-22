# PLAN: Kong Consumer & Key-Auth Integration (Option A)

> **Context**: Mở rộng `config-api` để hỗ trợ tạo Consumer, cấp Key-Auth và gắn Plugin `key-auth` vào Route.
> **Kiến trúc**: Stateful Management (Database as Source of Truth).

---

## 1. Mục tiêu (Goals)

1. Cung cấp REST API để tạo **Consumer** (app gọi API).
2. Cung cấp REST API để tạo **Auth Key** cho Consumer đó.
3. Cung cấp REST API để gắn **Plugin** (cụ thể là `key-auth`) vào một Route đang tồn tại.
4. Đảm bảo tính nhất quán giữa PostgreSQL DB nội tại và Kong Gateway. Mọi thay đổi đều lưu DB trước, gọi Kong sau.

---

## 2. Thiết kế Cơ sở dữ liệu (Database Schema Updates)

Cần bổ sung các bảng sau vào file `db/init.sql`.

### 2.1 Bảng `kong_consumers`
Lưu thông tin định danh của client gọi API.
- `id` (UUID, PK)
- `username` (VARCHAR) - Định danh (ví dụ: `erp-system`)
- `custom_id` (VARCHAR, Nullable)
- `kong_consumer_id` (UUID) - ID trả về từ Kong
- `status` (VARCHAR) - `ACTIVE`, `INACTIVE`
- `created_at`, `updated_at`

### 2.2 Bảng `kong_consumer_keys`
Lưu trữ auth keys cấp cho Consumer.
- `id` (UUID, PK)
- `kong_consumer_id` (UUID, FK) - Link tới bảng `kong_consumers`
- `key_value` (VARCHAR) - Chuỗi API Key bí mật
- `kong_key_id` (UUID) - ID credential trả về từ Kong
- `status` (VARCHAR) - `ACTIVE`, `REVOKED`
- `created_at`, `updated_at`

### 2.3 Bảng `kong_route_plugins`
Lưu các plugin gắn vào một route.
- `id` (UUID, PK)
- `kong_route_config_id` (UUID, FK) - Link tới bảng `kong_route_configs`
- `plugin_name` (VARCHAR) - Tên plugin (vd: `key-auth`)
- `kong_plugin_id` (UUID) - ID plugin trả về từ Kong
- `config` (JSONB) - Cấu hình riêng của plugin (nếu có)
- `status` (VARCHAR) - `ACTIVE`, `INACTIVE`
- `created_at`, `updated_at`

---

## 3. Cập nhật Kong Client (`kong_client.go`)

Bổ sung các hàm để gọi Kong Admin API:
1. `CreateConsumer(username string) (uuid.UUID, error)` -> `POST /consumers`
2. `CreateKeyAuth(consumerID uuid.UUID, key string) (uuid.UUID, error)` -> `POST /consumers/{id}/key-auth`
3. `AddPluginToRoute(routeID uuid.UUID, pluginName string) (uuid.UUID, error)` -> `POST /routes/{id}/plugins`
4. Hỗ trợ các hàm xoá (Delete) tương ứng để có thể rollback.

---

## 4. Bổ sung Models & Repositories

Tạo các structs GORM trong `internal/model/`:
- `KongConsumer`
- `KongConsumerKey`
- `KongRoutePlugin`

Tạo Repository `internal/repository/`:
- `consumer_repo.go` (CRUD for consumers and keys)
- `plugin_repo.go` (CRUD for route plugins)

---

## 5. Bổ sung Service Layer

Tạo `internal/service/auth_svc.go`:
- `CreateConsumer(input CreateConsumerInput) (*model.KongConsumer, error)`
- `CreateConsumerKey(consumerID uuid.UUID, key string) (*model.KongConsumerKey, error)`
- `AddKeyAuthPlugin(routeConfigID uuid.UUID) (*model.KongRoutePlugin, error)`

**Flow ví dụ cho AddKeyAuthPlugin:**
1. Lấy thông tin `RouteConfig` từ DB -> Lấy `KongRouteID`.
2. Bắt đầu Transaction.
3. Insert record `kong_route_plugins` status `PENDING`.
4. Gọi `kong.AddPluginToRoute`.
5. Update record status `ACTIVE` và lưu `kong_plugin_id`.
6. Commit Transaction.

---

## 6. REST API Endpoints Mới

Cần thêm vào `route_config_handler.go` hoặc tạo `auth_handler.go`:

| Method | Endpoint | Payload / Mô tả |
|--------|----------|----------------|
| `POST` | `/api/v1/consumers` | `{"username": "erp-system"}` |
| `POST` | `/api/v1/consumers/{id}/keys` | `{"key": "secret-123"}` |
| `POST` | `/api/v1/route-configs/{id}/plugins` | `{"plugin_name": "key-auth"}` |

---

## 7. Verification / E2E Testing

1. Tạo Route config (thành công).
2. Tạo Consumer (thành công).
3. Tạo Key cho Consumer (thành công).
4. Gắn Plugin `key-auth` vào Route config ở bước 1.
5. Cố gắng gọi Proxy API mà **không có Key** -> Kong trả về `401 Unauthorized`.
6. Gọi Proxy API **truyền Header** `apikey: secret-123` -> Trả về `200 OK`.

---

## 8. Tiến độ triển khai

- [x] Cập nhật `db/init.sql` (bảng mới + index - Đã AutoMigrate)
- [x] Cập nhật `kong_client.go` (3 endpoints Kong mới)
- [x] Tạo Models và Repo cho Consumer, Plugin
- [x] Tạo Service Logic kết hợp DB transaction và Kong call
- [x] Mở rộng Handlers và Router trong `main.go`
- [x] Viết test kịch bản E2E mới (Đã verify thành công).
- [x] Cập nhật postman collection.

