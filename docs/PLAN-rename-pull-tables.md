# Đổi tên bảng lưu trạng thái Pull Jobs

## Bối cảnh và Mục tiêu
Đổi tên 2 bảng trong cơ sở dữ liệu để tên gọi phản ánh đúng nghiệp vụ Pull Data hơn:
- `job_failed_pages` đổi thành `pull_errors`
- `sync_state_data` đổi thành `pull_history`

## User Review Required
> [!WARNING]
> Việc đổi tên bảng sẽ cần tác động trực tiếp vào Database. Cần đảm bảo không có tiến trình Pull Job nào đang chạy (trạng thái INPROGRESS) để tránh gây lỗi runtime trước khi thực thi script đổi tên bảng. Ngoài ra, bạn muốn tôi tự kết nối CSDL để chạy script `ALTER TABLE` hay bạn sẽ tự chạy script?

## Đề xuất Thay đổi (Proposed Changes)

### Database Migration
Cần chạy script SQL để đổi tên bảng (và các index liên quan để đồng bộ):
```sql
-- Đổi tên bảng job_failed_pages
ALTER TABLE job_failed_pages RENAME TO pull_errors;
ALTER INDEX idx_failed_pages_job_status RENAME TO idx_pull_errors_job_status;

-- Đổi tên bảng sync_state_data
ALTER TABLE sync_state_data RENAME TO pull_history;
ALTER INDEX idx_sync_state_data_status RENAME TO idx_pull_history_status;
ALTER INDEX idx_sync_state_data_job_id RENAME TO idx_pull_history_job_id;
```

---

### admin-service

#### [MODIFY] `src/services/admin-service/internal/model/failed_page.go`
- Đổi chuỗi trả về trong hàm `TableName()` từ `"job_failed_pages"` thành `"pull_errors"`.

#### [MODIFY] `src/services/admin-service/internal/model/sync_state.go`
- Đổi chuỗi trả về trong hàm `TableName()` từ `"sync_state_data"` thành `"pull_history"`.

---

### integration-service

#### [MODIFY] `src/services/integration-service/internal/model/failed_page.go`
- Đổi chuỗi trả về trong hàm `TableName()` từ `"job_failed_pages"` thành `"pull_errors"`.

#### [MODIFY] `src/services/integration-service/internal/model/sync_state.go`
- Đổi chuỗi trả về trong hàm `TableName()` từ `"sync_state_data"` thành `"pull_history"`.

## Kế hoạch Kiểm thử (Verification Plan)
1. Xác nhận câu lệnh DDL SQL đổi tên bảng đã chạy thành công trong DB.
2. Build lại cả 2 services `admin-service` và `integration-service` để đảm bảo code Golang cập nhật model mới.
3. Trigger API `/api/v1/pull-jobs/CDLQG/run` và kiểm tra bảng `pull_history` xem lịch sử có được ghi lại bình thường không.
