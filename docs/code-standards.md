# Code Standards

## Overview

Chuẩn này phản ánh cách repo đang được tổ chức và cách nên tiếp tục mở rộng.

## General Principles

- ưu tiên YAGNI, KISS, DRY
- sửa trực tiếp file hiện có nếu hợp lý, tránh tạo file thừa
- giữ code dễ đọc, self-documenting
- validate ở boundary với input/external systems
- không mock giả luồng chính chỉ để qua test/build

## Repository Organization

- service code nằm dưới `srcs/<service-name>/`
- tài liệu evergreen nằm dưới `docs/`
- kế hoạch và báo cáo agent nằm dưới `plans/`
- deploy assets nằm dưới `deploy/`

## Go Service Structure

Mỗi service Go nên giữ pattern:
- `cmd/` — entrypoint
- `internal/config/` — config loading
- `internal/handler/` — HTTP layer
- `internal/service/` — business logic
- `internal/repository/` — persistence/external storage
- `internal/model/` — structs/entities
- `pkg/` — reusable packages hoặc clients

## Naming

- file markdown: kebab-case
- file code mới: theo convention ngôn ngữ, nhưng ưu tiên descriptive names
- endpoint groups: theo domain nghiệp vụ, tránh route quá generic
- service/repository names: bám sát domain object hoặc integration concern

## File Size

- ưu tiên giữ file code dưới ~200 LOC khi thực tế cho phép
- nếu file lớn nhanh, tách theo concern: handler/service/repository/helper/domain package
- với tài liệu, ưu tiên doc ngắn và liên kết chéo hơn là một file rất dài

## Configuration

- dùng `.env.example` để mô tả biến cần thiết
- không commit secrets thật
- config phải được nạp tập trung qua package config của từng service

## Database & Migration

- repo hiện dùng `AutoMigrate`; khi thêm model mới, review kỹ tác động schema
- model, repository, service nên thay đổi đồng bộ theo flow dữ liệu

## Observability

- mọi service phải giữ `GET /health`
- logs phải đủ để debug integration flow
- ingest service ưu tiên OTEL-compatible instrumentation

## Testing

- ưu tiên test thật với service behavior thực
- dùng mock datasource cho test e2e/local flow khi phù hợp
- với thay đổi backend, xác thực ít nhất compile/run/test command liên quan

## Documentation

- khi thay đổi kiến trúc, deploy flow, hoặc chuẩn code, cập nhật `docs/`
- nếu doc cũ không còn đúng, sửa hoặc thay thế, không để song song mâu thuẫn

## References

- `README.md`
- `docs/codebase-summary.md`
- `srcs/dmst-admin-api/`
- `srcs/dmst-ingest-svc/`
- `srcs/dmst-mock-datasource/`
