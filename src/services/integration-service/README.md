# Integration Service

Dịch vụ quản lý tích hợp dữ liệu - tiếp nhận, xác thực, chuyển đổi dữ liệu từ các nguồn bên ngoài.

## Chức năng chính

- Cấu hình kết nối nguồn dữ liệu
- Quản lý luồng thu thập (API/File/Batch)
- Xác thực schema dữ liệu
- Lọc trùng lặp qua Redis pre-filter
- Đẩy dữ liệu vào Kafka topic để xử lý tiếp

## Hạ tầng phụ thuộc

- PostgreSQL (metadata)
- Apache Kafka (message broker)
- Redis (cache, pre-filter)
- Vault (quản lý secrets)
