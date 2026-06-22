# Codebase Summary

## Overview

Repo được tổ chức theo kiểu multi-service Go, thêm một khu vực deploy tập trung và bộ docs mức repo.

## Top-level Structure

| Path | Purpose |
|---|---|
| `srcs/dmst-admin-api/` | backend quản trị tích hợp/chia sẻ dữ liệu |
| `srcs/dmst-ingest-svc/` | ingest pipeline service |
| `srcs/dmst-mock-datasource/` | mock data service cho local/test |
| `deploy/` | Dockerfiles, env templates, deploy scripts |
| `docs/` | tài liệu kỹ thuật và vận hành |
| `plans/` | plan/report của agent workflow |

## Service Summary

### `srcs/dmst-admin-api`
Cấu trúc chính:
- `cmd/api/` — entrypoint
- `internal/config/` — nạp cấu hình
- `internal/handler/` — HTTP handlers
- `internal/model/` — models GORM
- `internal/repository/` — truy cập DB
- `internal/service/` — business logic
- `pkg/` — clients và helpers dùng lại
- `test/` — integration tests

Điểm đáng chú ý:
- tự migrate nhiều bảng quản trị và sync state
- tích hợp Kong Admin, Vault, Kafka, schema registry
- có pipeline `kho-mo-sync` và cron scheduler

### `srcs/dmst-ingest-svc`
Cấu trúc chính:
- `cmd/ingest/` — entrypoint
- `internal/config/` — config
- `internal/handler/` — HTTP handlers
- `internal/model/` — datasource, job, kho-mo log
- `internal/repository/` — DB access
- `internal/service/` — ingest, job orchestration, kho-mo processing
- `pkg/logger/`, `pkg/tracer/` — observability

Điểm đáng chú ý:
- writer Kafka cho ingest job
- Redis dùng cho delta filter ở Kho Mở
- OpenTelemetry cho logs/traces
- có debug endpoints cho Redis

### `srcs/dmst-mock-datasource`
Cấu trúc chính:
- `cmd/main.go` — HTTP server đơn giản
- `data/seed.go` — sinh dữ liệu deterministic

Điểm đáng chú ý:
- dữ liệu seed nằm trong memory
- endpoint đơn giản, phù hợp demo/test local

## Deploy Area

`deploy/` gồm:
- `docker/` — Dockerfile theo từng service
- `envs/` — env templates theo môi trường và service
- `templates/` — compose/templates dùng khi deploy
- `scripts/ci/deploy.sh` — script deploy nhiều service
- `scripts/dev/` — build/up local wrappers
- `scripts/lib/` — shared deploy functions

## Existing Documentation State

| File | Status |
|---|---|
| `docs/Huong-dan-chay-test.md` | hữu ích, mô tả test/deploy flow đa service |
| `docs/README.md` | hẹp phạm vi, chỉ mô tả admin API |
| `deploy/README.md` | còn nhiều nội dung portal-centric, cần đọc cẩn thận |

## Current Architecture Pattern

Pattern chính là layered service:
- handler
- service
- repository
- model
- pkg client/helper

Điều này nhất quán giữa admin API và ingest service, giúp onboarding dễ hơn.

## References

- `srcs/dmst-admin-api/README.md`
- `srcs/dmst-admin-api/cmd/api/main.go`
- `srcs/dmst-ingest-svc/docs/HUONG_DAN_CHAY.md`
- `srcs/dmst-ingest-svc/cmd/ingest/main.go`
- `srcs/dmst-mock-datasource/cmd/main.go`
- `deploy/scripts/ci/deploy.sh`
