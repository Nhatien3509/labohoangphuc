# Project Overview & PDR

## Overview

Hệ thống 26.ĐMST.C12.TichHopChiaSe là nền tảng tích hợp, chia sẻ và khai thác dữ liệu cho Trung tâm sáng tạo. Repo hiện tại tập trung vào lớp backend service, ingest pipeline, mock datasource và hạ tầng deploy.

## Business Goals

- tập trung quản lý cấu hình tích hợp dữ liệu
- hỗ trợ chia sẻ dữ liệu an toàn, có giám sát
- cho phép ingest dữ liệu theo pull, push, sync định kỳ
- tạo môi trường test/demo bằng nguồn dữ liệu giả lập

## Product Scope

### In scope
- admin API cho route, Kafka, schema, audit, Kong auth
- ingest service cho datasource, job, push API, kho mở receive
- mock datasource cho test local/demo
- deploy scripts, env templates, Dockerfiles

### Out of scope
- frontend portal đầy đủ trong repo này
- data governance workflow ngoài các service hiện có
- production secrets thực tế

## Primary Users

- kỹ sư backend tích hợp dữ liệu
- vận hành/devops triển khai stack
- kiểm thử viên xác thực luồng end-to-end
- đơn vị quản trị tích hợp/Kong/Kafka

## Functional Requirements

1. Quản lý route và cấu hình publish API.
2. Quản lý Kafka topics và schema đăng ký.
3. Quản lý datasource và ingest jobs.
4. Hỗ trợ ingest kiểu pull, push, và đồng bộ kho mở.
5. Theo dõi audit log, trạng thái đồng bộ, job history.
6. Hỗ trợ mock data để test nhanh.

## Non-Functional Requirements

- hiệu năng đủ cho ingest batch và sync theo trang
- khả dụng cao ở lớp service và deploy automation
- bảo mật ở biên tích hợp: Kong, Vault, schema validation, audit
- dễ quan sát qua logs, health check, OTEL/SigNoz
- dễ mở rộng bằng service/module Go riêng

## Success Criteria

- 3 service khởi chạy độc lập với cấu hình rõ ràng
- admin service và ingest service giao tiếp được cho luồng Kho Mở
- deploy scripts tái sử dụng được cho nhiều môi trường
- tài liệu đủ để dev mới hiểu kiến trúc và chạy thử hệ thống

## Constraints

- phụ thuộc PostgreSQL, Kafka, Redis, Kong, Vault, SigNoz
- nhiều endpoint và tên miền nghiệp vụ đang dùng tiếng Việt không dấu/có dấu theo bối cảnh cũ
- một phần tài liệu cũ chưa đồng bộ với repo state hiện tại

## References

- `README.md`
- `docs/Huong-dan-chay-test.md`
- `srcs/dmst-admin-api/cmd/api/main.go`
- `srcs/dmst-ingest-svc/cmd/ingest/main.go`
- `srcs/dmst-mock-datasource/cmd/main.go`
- `deploy/scripts/ci/deploy.sh`
