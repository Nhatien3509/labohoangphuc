# Deployment Guide

## Overview

Repo có vùng `deploy/` để build và deploy nhiều service theo môi trường. Trọng tâm hiện tại là các service Go trong `srcs/`.

## Deploy Structure

| Path | Purpose |
|---|---|
| `deploy/docker/` | Dockerfile theo service |
| `deploy/envs/` | env templates theo môi trường |
| `deploy/templates/` | compose/template files |
| `deploy/scripts/ci/deploy.sh` | script deploy chính |
| `deploy/scripts/dev/` | helper scripts local |
| `deploy/scripts/lib/` | shared deploy functions |

## Supported Deploy Script Behavior

`deploy/scripts/ci/deploy.sh` hỗ trợ:
- deploy 1 hoặc nhiều service cùng lúc
- build-only mode
- cleanup image cũ
- force overwrite compose file
- chọn environment động từ `deploy/envs/*`
- chọn service động từ `deploy/docker/*`

## Typical Commands

```bash
cd deploy/scripts/ci

./deploy.sh config demo
./deploy.sh mockds demo
./deploy.sh ingest demo
./deploy.sh mockds,ingest demo
./deploy.sh config,mockds,ingest demo --force-compose
./deploy.sh ingest demo --build-only
```

## Local Run References

### Admin API
```bash
cd srcs/dmst-admin-api
go run cmd/api/main.go
```

### Ingest Service
```bash
cd srcs/dmst-ingest-svc
go run cmd/ingest/main.go
```

### Mock Datasource
```bash
cd srcs/dmst-mock-datasource
go run cmd/main.go
```

## Required Infrastructure

Tùy luồng, hệ thống có thể cần:
- PostgreSQL
- Kafka
- Redis
- Kong Admin API
- Vault
- SigNoz / OTEL collector

## Validation After Deploy

- gọi `GET /health` cho từng service
- kiểm tra logs container/service
- xác thực kết nối Kafka/PostgreSQL/Redis/Kong theo service liên quan
- nếu test Kho Mở flow, xác thực cả admin service lẫn ingest service

## Current Caveats

- một số tài liệu deploy cũ trong `deploy/` còn nói về portal hoặc cấu trúc server cũ
- khi dùng tài liệu cũ, ưu tiên kiểm tra lại với `deploy/scripts/ci/deploy.sh` và thư mục `deploy/envs/` hiện tại

## References

- `deploy/scripts/ci/deploy.sh`
- `deploy/README.md`
- `docs/Huong-dan-chay-test.md`
- `srcs/dmst-ingest-svc/docs/HUONG_DAN_CHAY.md`
