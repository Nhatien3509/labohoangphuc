# Cập nhật Schema Register và Thêm Audit Log

## Lỗi hiện tại (Phân tích)
- **Nguyên nhân lỗi 422 (Invalid schema)**: Hệ thống trả lỗi `Illegal character in: nguon-kho-mo-2005-v1` khi tương tác với Kafka Schema Registry. Nguyên nhân là do chuẩn đặt tên (name) của Apache Avro **không cho phép sử dụng ký tự gạch ngang (`-`)**. Theo đặc tả của Avro, tên `name` phải bắt đầu bằng `[A-Za-z_]` và các ký tự tiếp theo chỉ bao gồm `[A-Za-z0-9_]`. Việc dùng `nguon-kho-mo-2005-v1` làm tên record đã vi phạm quy tắc này.
- **Tình trạng Audit Log**: Qua kiểm tra file `handler.go` của `admin-service`, hàm `RegisterSchema` (API `POST /api/v1/schemas/register`) hiện tại **CHƯA** gọi `auditSvc.LogAction` để ghi nhận lại hành động đăng ký schema (thành công hay thất bại).

## Đề xuất giải pháp

1. **Sửa lỗi Illegal character (Avro Name)**:
   - Cần bổ sung logic chuẩn hóa tên subject/name (Sanitize) trước khi chuyển đổi file Excel thành Avro schema. Cụ thể là thay thế các ký tự không hợp lệ (như `-`) thành dấu gạch dưới (`_`) để tuân thủ chuẩn Avro.
   - Nơi thực hiện: `ImportSchema` trong `admin-service`.

2. **Bổ sung Audit Log**:
   - Thêm lời gọi `h.auditSvc.LogAction` vào hàm `RegisterSchema` sau khi xử lý thành công `h.svc.ImportSchema`.
   - Cần sử dụng model action thích hợp, ví dụ: `model.ActionCreateSchema` hoặc `model.ActionRegisterSchema`.

## Kế hoạch triển khai (Task Breakdown)

### 1. `src/services/admin-service/internal/handler/schema-registry/handler.go`
- **[MODIFY]** Trong hàm `RegisterSchema`:
  - Thêm đoạn mã ghi audit log.
  ```go
  h.auditSvc.LogAction(c.Request.Context(), service.LogEntry{
      Action:     model.ActionRegisterSchema, // Thay bằng action tương ứng trong model
      Resource:   model.ResourceSchema,
      ResourceID: subject,
      ActorIP:    c.ClientIP(),
  })
  ```

### 2. `src/services/admin-service/internal/service/schema-registry/service.go` (Hoặc file chuyển đổi Excel -> Avro)
- **[MODIFY]** Trong logic tạo Avro từ file Excel, chuẩn hóa tên name:
  - `validAvroName := strings.ReplaceAll(subject, "-", "_")`

## Verification Checklist
- [ ] Gửi POST `/api/v1/schemas/register` với subject chứa dấu `-` và xác nhận không còn lỗi `422 Illegal character`.
- [ ] Kiểm tra cơ sở dữ liệu bảng `audit_logs` có ghi nhận bản ghi mới với action tương ứng cho schema register.
