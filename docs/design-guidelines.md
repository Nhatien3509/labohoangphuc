# Design Guidelines

## Overview

Guideline này dành cho các thay đổi backend trong repo hiện tại.

## Service Design

- giữ mỗi service theo domain rõ ràng
- admin API chịu trách nhiệm quản trị cấu hình/integration control plane
- ingest service chịu trách nhiệm pipeline xử lý dữ liệu runtime
- mock datasource chỉ phục vụ test/demo, không nhồi business logic production vào đây

## Layering

Ưu tiên flow:
1. handler
2. service
3. repository/client
4. model

Không để handler ôm logic nghiệp vụ lớn.

## API Design

- giữ `GET /health` cho mọi service
- nhóm route dưới `/api/v1`
- đặt tên endpoint theo domain thay vì utility chung chung
- khi thêm debug endpoint, ghi rõ phạm vi và rủi ro vận hành

## Integration Design

- integration với Kafka, Kong, Vault, Redis nên được bọc trong service hoặc pkg client rõ ràng
- config ngoại vi phải đi qua package config, không đọc env rải rác
- các luồng sync nên có logging đủ để trace theo request/job/page

## Data Flow Design

- checkpoint/state nên persist thay vì chỉ giữ in-memory
- retry/failure path nên quan sát được qua log hoặc bảng trạng thái
- schema validation nên bật/tắt bằng config rõ ràng

## Documentation Design

- repo-level docs mô tả bức tranh tổng thể
- service-specific docs mô tả cách chạy/service details
- tránh để nhiều file cùng mô tả một thứ nhưng lệch scope

## UI/Language Notes

- nghiệp vụ trong repo đang dùng tiếng Việt là chính
- tên file docs nên dùng kebab-case để ổn định tooling
- nội dung nên ngắn, rõ, bám repo state thực tế

## References

- `docs/code-standards.md`
- `docs/system-architecture.md`
- `srcs/dmst-admin-api/cmd/api/main.go`
- `srcs/dmst-ingest-svc/cmd/ingest/main.go`
