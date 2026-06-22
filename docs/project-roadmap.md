# Project Roadmap

## Overview

Roadmap này phản ánh backlog kiến trúc mức cao dựa trên repo state hiện tại, không phải cam kết release chính thức.

## Phase Summary

| Phase | Status | Focus |
|---|---|---|
| Phase 1 | Completed | nền tảng admin API |
| Phase 2 | Completed | ingest service cơ bản |
| Phase 3 | In Progress | Kho Mở sync/receive pipeline |
| Phase 4 | In Progress | deploy automation và môi trường demo |
| Phase 5 | Planned | hardening, test coverage, doc alignment |

## Phase 1 — Admin Platform

Done:
- route management
- Kafka topic management
- schema registry integration
- Kong route/auth management
- audit log và sync state persistence

## Phase 2 — Ingest Platform

Done:
- datasource CRUD
- job trigger/history
- Kafka publishing
- basic health endpoints

## Phase 3 — Kho Mở Data Flow

Current focus:
- admin side sync từ API thật
- ingest side receive/validate/publish
- Redis delta filter
- failed page và checkpoint handling

## Phase 4 — Deployment & Environments

Current focus:
- chuẩn hóa env templates
- multi-service deploy script
- Docker build/deploy flow theo service
- tài liệu manual deploy/run/test

## Phase 5 — Hardening

Recommended next:
- rà soát tài liệu cũ và loại bỏ lệch ngữ cảnh portal
- tăng test coverage cho luồng sync và ingest
- chuẩn hóa config matrix cho dev/demo/prod
- review security cho Kong/Vault/schema/Redis debug endpoints
- làm rõ ownership giữa service docs và repo-level docs

## Success Indicators

- service khởi chạy ổn định theo từng môi trường
- luồng admin -> ingest -> Kafka quan sát được end-to-end
- tài liệu onboarding đủ cho dev mới
- deploy scripts dùng được nhất quán giữa môi trường

## Dependencies

- PostgreSQL
- Kafka
- Redis
- Kong
- Vault
- SigNoz

## References

- `docs/system-architecture.md`
- `docs/deployment-guide.md`
- `docs/Huong-dan-chay-test.md`
