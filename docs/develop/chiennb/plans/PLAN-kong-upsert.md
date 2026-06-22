# Project Plan: Kong Upsert Fallback (Option B)

## Context
Xử lý lỗi `409 Conflict` khi tạo Kong Service và Route trùng tên. 
Giải pháp: Áp dụng chiến lược "Try-then-Fallback". Hệ thống sẽ cố gắng gọi `POST` để tạo mới, nếu bắt được lỗi `409 Conflict` (trùng lặp), sẽ tự động gọi `PATCH` với tên (`name`) của đối tượng để cập nhật thông tin và trả về `ID` như bình thường. Tầng Service (`RouteConfigService`) sẽ không cần quan tâm đến logic ẩn này, giúp code trong suốt và sạch sẽ.

## Component Breakdown

### 1. Cập nhật `kong_client.go`
- **Tạo Custom Error**: Định nghĩa một error kiểu `ErrKongConflict` để dễ dàng catch lỗi 409 từ hàm `do()`.
- **Sửa hàm `do()`**: Kiểm tra nếu `resp.StatusCode == http.StatusConflict (409)`, trả về lỗi `ErrKongConflict`.
- **Sửa `CreateService`**: 
  - Gọi `POST /services` như hiện tại.
  - Kiểm tra `errors.Is(err, ErrKongConflict)`.
  - Nếu đúng, gọi `PATCH /services/{name}` (chú ý dùng `name` thay vì `id`) truyền payload có `url`.
  - Parse response từ PATCH để lấy `id` trả về.
- **Sửa `CreateRoute`**:
  - Bổ sung tham số `routeName string` vào signature hàm.
  - Bổ sung trường `"name": routeName` vào JSON payload.
  - Gọi `POST /services/{serviceID}/routes`.
  - Nếu gặp `ErrKongConflict`, gọi `PATCH /routes/{routeName}` truyền payload có `paths` và `strip_path`.
  - Parse response từ PATCH để lấy `id` trả về.

### 2. Cập nhật `route_config_svc.go`
- **Sửa luồng `CreateRouteConfig`**:
  - Trong bước 5 (Kong CreateRoute), định nghĩa `routeName := fmt.Sprintf("%s-route", serviceName)`.
  - Truyền `routeName` vào khi gọi `s.kong.CreateRoute`.

### 3. Verification & Testing (Kế hoạch Kiểm tra)
- **Kiểm tra Tạo Mới (Create)**: Chạy API POST tạo Route Config lần đầu, kiểm tra trong DB và trên Kong có sinh ra Service và Route với đầy đủ `id` và `name` không. (Đã đạt).
- **Kiểm tra Cập Nhật (Upsert)**: Gọi lại API POST với cùng `SystemCode`, `ActionCode` (tạo trùng lặp) nhưng đổi `upstream_url`.
  - Kỳ vọng: API trả về 200/201 Success.
  - Kiểm tra trên Kong: `url` của Service phải được update, `paths` của Route phải được update.
  - Kiểm tra DB: Bản ghi RouteConfig vẫn Active, ID service/route không thay đổi.
- **KẾT QUẢ:** Đã kiểm chứng E2E thành công 100%.


## Agent Assignments
- `backend-specialist`: Thực hiện sửa code trong `kong_client.go` và `route_config_svc.go`.
- `tester`: Gọi API hoặc viết unit/E2E test để verify luồng Upsert.
