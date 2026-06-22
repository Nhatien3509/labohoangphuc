# Kế hoạch: Chuyển đổi mã bộ ban ngành thành Database Table (data_type_catalogs)

## Bối cảnh (Context Check)
Người dùng muốn tạo model và các API (bulk-insert, get all) trong `admin-service` để quản lý danh mục mã loại dữ liệu (`data_type_catalogs`). Các handler API này sẽ nằm trong thư mục `danh-muc-ma-loai-du-lieu`. Dữ liệu sẽ được lưu xuống PostgreSQL để hệ thống linh hoạt thay vì hardcode.

## Câu hỏi Socratic (Socratic Gate)
Trước khi bắt đầu code, chúng ta cần làm rõ một số điểm sau. Bạn vui lòng xác nhận trước khi tiếp tục:

1. **Routing Path:** Đường dẫn API mong muốn là gì? (Ví dụ: `POST /api/v1/danh-muc-ma-loai-du-lieu/bulk-insert` và `GET /api/v1/danh-muc-ma-loai-du-lieu`)
2. **Xử lý trùng lặp (Bulk-Insert):** Nếu trong danh sách đẩy lên có các `code` đã tồn tại trong Database, bạn muốn hệ thống ghi đè (upsert/update), bỏ qua (ignore), hay báo lỗi toàn bộ (transaction rollback)?
3. **Phân trang (Pagination) & Filter:** API `get all` có cần phân trang và hỗ trợ các query lọc cơ bản (ví dụ: filter theo `ministry_code`, `is_active`) không? Hay mặc định trả về mảng toàn bộ dữ liệu (vì bảng này dự kiến cũng ít record)?
4. **GORM / Database config:** Dự án đang sử dụng ORM nào (GORM hay thao tác SQL thuần)? Tên bảng (`data_type_catalogs`) có cần tiền tố hay tuân theo chuẩn đặt tên đặc thù nào của công ty không?

## Phân rã công việc (Task Breakdown)
1. **Model & DTO:**
   - Tạo struct model `DataTypeCatalog` trong thư mục `internal/model`. Cấu hình các thẻ GORM/JSON.
   - Tạo các file DTO (Request/Response) trong thư mục `internal/dto/danh-muc-ma-loai-du-lieu`.
2. **Repository:**
   - Xây dựng `DataTypeCatalogRepository` tại `internal/repository`.
   - Implement các hàm `BulkInsert` (hoặc Upsert tuỳ lựa chọn) và `GetAll`.
3. **Service:**
   - Xây dựng `DataTypeCatalogService` tại `internal/service/danh-muc-ma-loai-du-lieu`.
   - Thực hiện logic validate DTO, ánh xạ (mapping) từ DTO sang Model và ngược lại.
4. **Handler (API):**
   - Xây dựng file `internal/handler/danh-muc-ma-loai-du-lieu/handler.go`.
   - Khởi tạo các API endpoints (`BulkInsert` và `GetAll`), binding request, xử lý trả về response chuẩn.
5. **Đăng ký Route:**
   - Bổ sung cấu hình route cho handler này trong tệp router chính của dự án.
