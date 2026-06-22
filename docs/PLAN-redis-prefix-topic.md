# Kế hoạch thay đổi Redis Key Prefix theo Kafka Topic

Việc thay đổi này giúp tách biệt dữ liệu cache trong Redis dựa trên tên Topic, cho phép hệ thống chạy đa luồng dữ liệu mà không bị xung đột.

## Mục tiêu
- Loại bỏ hằng số `redisKeyPrefix` cứng ("khomo:").
- Sử dụng tên Kafka Topic (`kafkaTopic`) làm tiền tố cho các Redis Key.
- Định dạng Key mới: `{topic_name}:{item.id}`.

## User Review Required
> [!IMPORTANT]
> - Người dùng sẽ tự thực hiện xóa các key cũ (`khomo:*`) thông qua API quản trị.
> - Sau khi đổi code, hệ thống sẽ sử dụng prefix mới ngay lập tức.

## Các thay đổi đề xuất

### Integration Service

#### [MODIFY] [kho_mo_delta.go](file:///d:/GTSC/DMST/demo/26.dmst.c12.tichhopchiase/src/services/integration-service/internal/service/kho_mo_delta.go)
1. **Xóa hằng số**: Loại bỏ `const redisKeyPrefix = "khomo:"`.
2. **Chuyển đổi Helper**: Di chuyển hàm `buildRedisKeys` và `buildKafkaMessage` vào trong struct hoặc truyền `prefix` vào. Hợp lý nhất là chuyển `buildRedisKeys` thành method của `khoMoDeltaFilter`.
3. **Cập nhật Prefix**: Thay thế toàn bộ logic sử dụng `redisKeyPrefix` sang `f.kafkaTopic + ":"`.
    - `ListKeys`: `f.kafkaTopic + "*"`
    - `GetVersions`: `f.kafkaTopic + ":" + id`
    - `DeleteKey`: `f.kafkaTopic + ":" + id`
    - `buildRedisKeys`: `f.kafkaTopic + ":" + item.ID`

## Kế hoạch kiểm tra
1. Kiểm tra log khởi động để đảm bảo topic được load đúng.
2. Monitor Redis để xác nhận các key mới được tạo có prefix trùng với topic name.
