# Audit Service

Dịch vụ ghi nhận nhật ký kiểm toán - lưu trữ immutable logs cho toàn bộ hệ thống.

## Chức năng chính

- Thu thập log từ Kong API Gateway và các services
- Ghi nhận immutable audit logs
- Truy vấn và tìm kiếm nhật ký
- Hỗ trợ truy vết hoạt động người dùng

## Luồng dữ liệu

Kong + Services → Kafka AUDIT topic → Audit Service → PostgreSQL (immutable)

## Hạ tầng phụ thuộc

- PostgreSQL (audit logs storage)
- Apache Kafka (consumer từ AUDIT topic)
