# System Architecture

## Overview

Hệ thống hiện tại gồm 3 service Go và một lớp deploy automation. Trọng tâm kiến trúc là quản trị cấu hình tích hợp, ingest dữ liệu, và mô phỏng datasource để kiểm thử.

## High-Level Components

| Component | Role |
|---|---|
| `dmst-admin-api` | quản trị route, Kafka, schema, Kong auth, Kho Mở sync |
| `dmst-ingest-svc` | ingest datasource/jobs, push receive, Kho Mở receive |
| `dmst-mock-datasource` | mock REST datasource cho test/demo |
| PostgreSQL | lưu cấu hình, job, audit, sync state |
| Kafka | transport/event stream cho dữ liệu ingest |
| Redis | delta filter/cache cho luồng Kho Mở |
| Kong | gateway/admin integration |
| Vault | secret/transit integration trong admin service |
| SigNoz / OTEL | observability |

## Main Flows

### 1. Datasource Pull/Push
1. client tạo datasource trong ingest service
2. trigger job hoặc push payload vào ingest endpoint
3. ingest service ghi job/state vào PostgreSQL
4. ingest service publish dữ liệu sang Kafka

### 2. Kho Mở Sync
1. admin service gọi API nguồn Kho Mở
2. admin service quản lý checkpoint/sync state và failed pages
3. admin service gửi payload sang ingest service
4. ingest service validate schema nếu bật feature flag
5. ingest service áp dụng delta filter qua Redis rồi publish Kafka

### 3. API Gateway / Route Management
1. operator thao tác route config qua admin API
2. admin service lưu lịch sử và cấu hình trong PostgreSQL
3. admin service gọi Kong Admin API để apply config/auth/plugin
4. audit log ghi nhận thay đổi

## Runtime Architecture

```text
Client/Operator
   |
   +--> dmst-admin-api ----> PostgreSQL
   |         |              \
   |         |               +--> Kong
   |         |               +--> Vault
   |         |               +--> External Kho Mo API
   |         v
   |     dmst-ingest-svc --> Redis
   |         |
   |         +--> Kafka
   |
   +--> dmst-mock-datasource
```

## Code-Level Architecture

Cả admin API và ingest service đều bám pattern:
- handler nhận HTTP request
- service xử lý nghiệp vụ
- repository truy cập DB
- model định nghĩa thực thể
- pkg chứa client/helper tái dùng

## Operational Notes

- admin service có cron scheduler cho Kho Mở sync
- ingest service có health và debug endpoints cho Redis
- deploy script hỗ trợ multi-service deploy theo môi trường

## Known Documentation Gaps

- `deploy/README.md` và `deploy/templates/deployment-architecture.md` chứa nội dung định hướng portal/server cũ, không phản ánh hoàn toàn service graph hiện tại
- `docs/README.md` không còn là repo summary đầy đủ

## References

- `srcs/dmst-admin-api/cmd/api/main.go`
- `srcs/dmst-ingest-svc/cmd/ingest/main.go`
- `srcs/dmst-mock-datasource/cmd/main.go`
- `deploy/scripts/ci/deploy.sh`
