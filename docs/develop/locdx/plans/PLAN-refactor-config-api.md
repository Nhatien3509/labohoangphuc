# Tích Hợp (Clone) config-api vào adm-srv-go-api (Option A)

Kế hoạch này vạch ra các bước chi tiết để tái cấu trúc và gộp (merge) mã nguồn của `config-api` vào `adm-srv-go-api`, đảm bảo tính thống nhất về kiến trúc (sử dụng Gin framework), hệ thống log, và chia sẻ cùng một kết nối Database.

## User Review Required

> [!IMPORTANT]
> - Các API routes của `config-api` cũ là `/api/v1/route-configs`. Tôi dự định sẽ đăng ký các endpoints này vào nhóm `api` hiện tại trong `adm-srv-go-api` để thành `/api/v1/route-configs`. Xin hãy xác nhận nếu bạn muốn tiền tố (prefix) khác.
> - Cấu hình (Environment Variables) từ `config-api` (`KONG_ADMIN_URL`, `NOTIFY_URL`, v.v.) sẽ được gộp vào `.env` của `adm-srv-go-api`. 
> - Các tables của Kong (`kong_route_configs`, `kong_route_config_history`) sẽ được thêm vào tính năng `AutoMigrate` hiện tại của `adm-srv-go-api`.

## Proposed Changes

---

### Cấu hình (Config & Env)

Bổ sung các biến cấu hình từ `config-api` sang `adm-srv-go-api/internal/config/config.go`.

#### [MODIFY] `srcs/adm-srv-go-api/internal/config/config.go`
- Thêm trường `KongAdminURL`, `NotifyURL`, `NotifyMaxRetries`, `NotifyInitialDelay` vào struct `Config`.
- Cập nhật hàm `LoadConfig()` để lấy các giá trị này từ biến môi trường (hoặc `.env`).

#### [MODIFY] `srcs/adm-srv-go-api/.env.example`
- Bổ sung danh sách các cấu hình biến môi trường tương ứng của Kong.

---

### Tầng Model

Di chuyển các struct model của `config-api` vào `adm-srv-go-api`.

#### [NEW] `srcs/adm-srv-go-api/internal/model/kong_route_config.go`
- Copy nội dung từ `config-api/internal/model/kong_route_config.go`. Đổi package `model`.

#### [NEW] `srcs/adm-srv-go-api/internal/model/kong_route_config_history.go`
- Copy nội dung từ `config-api/internal/model/kong_route_config_history.go`. Đổi package `model`.

---

### Tầng Repository

Chuyển mã nguồn tầng Repository sang. Các hàm cơ bản không cần đổi logic, chỉ đổi import model.

#### [NEW] `srcs/adm-srv-go-api/internal/repository/route_config_repo.go`
- Copy `route_config_repo.go`. Sửa import để trỏ đến `adm-srv-go-api/internal/model`.

#### [NEW] `srcs/adm-srv-go-api/internal/repository/history_repo.go`
- Copy `history_repo.go`. Sửa import tương tự.

---

### Tầng Service

Chuyển logic lõi của Kong, Client và Notifier. Cập nhật hệ thống log từ `log.Printf` sang `zap.Logger`.

#### [NEW] `srcs/adm-srv-go-api/internal/service/errors.go`
- Copy file `errors.go` khai báo các lỗi của Kong (như `ErrDuplicateRoute`, v.v.).

#### [NEW] `srcs/adm-srv-go-api/internal/service/kong_client.go`
- Copy file `kong_client.go`. Thay thế `log.Printf` bằng package `logger` của `adm-srv-go-api`.

#### [NEW] `srcs/adm-srv-go-api/internal/service/notifier.go`
- Copy file `notifier.go`. Đổi `log.Printf` sang `logger`.

#### [NEW] `srcs/adm-srv-go-api/internal/service/route_config_svc.go`
- Copy `route_config_svc.go`. Cập nhật import cho Repo/Model và chuyển hệ thống log.

---

### Tầng Handler

Thực hiện Refactor hoàn toàn từ `net/http` sang `gin-gonic/gin` để đồng bộ.

#### [NEW] `srcs/adm-srv-go-api/internal/handler/route_config_handler.go`
- Khởi tạo `RouteConfigHandler` bằng `gin`.
- Chuyển đổi các hàm như `func (h *RouteConfigHandler) Create(w http.ResponseWriter, r *http.Request)` sang dạng `func (h *RouteConfigHandler) Create(c *gin.Context)`.
- Thay thế các phương thức `json.Unmarshal` và `writeError` bằng `c.ShouldBindJSON` và `c.JSON`.
- Thay thế `r.PathValue("id")` bằng `c.Param("id")`.

---

### Điểm khởi chạy (Main)

#### [MODIFY] `srcs/adm-srv-go-api/cmd/api/main.go`
- Bổ sung `&model.KongRouteConfig{}`, `&model.KongRouteConfigHistory{}` vào hàm `db.AutoMigrate(...)`.
- Khởi tạo `routeConfigRepo`, `historyRepo`, `kongClient`, `notifier` và `routeConfigSvc`.
- Khởi tạo `RouteConfigHandler`.
- Đăng ký các endpoints sau vào Router (nhóm `api`):
  - `POST /route-configs`
  - `GET /route-configs`
  - `GET /route-configs/:id`
  - `PUT /route-configs/:id`
  - `DELETE /route-configs/:id`
  - `POST /route-configs/:id/rollback`
  - `GET /route-configs/:id/history`

## Verification Plan

### Automated Tests
- Khởi động service `adm-srv-go-api` với file `.env` đã gộp cấu hình.
- Dùng Postman hoặc cURL gọi thử `POST /api/v1/route-configs` của ứng dụng chính `adm-srv-go-api`.
- Kiểm tra các log từ `zap` của ứng dụng để đảm bảo `kongClient` và `notifier` hoạt động bình thường.
- Đảm bảo database lưu trữ dữ liệu chính xác trên các tables của Kong.

### Manual Verification
- Review lại toàn bộ kiến trúc.
- Chạy thử E2E script `run_e2e.ps1` nếu có thể thiết lập để trỏ URL API về cổng của `adm-srv-go-api`.
