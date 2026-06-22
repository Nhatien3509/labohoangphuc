# Plan 05: Docker Compose — Orchestration

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 4
> **Dependencies:** Plan 03 ✅, Plan 04 ✅
> **Output:** `docker-compose.yml` + `.env.example` hoàn chỉnh
> **Status:** ✅ DONE (YAML validated — Docker build pending khi Docker Desktop chạy)

---

## Goal

Viết `docker-compose.yml` orchestrate 8 containers với network, healthchecks, dependency ordering, và profiles.

## Tasks

- [x] Task 1: `postgres` — postgres:16-alpine, port 5432, mount `db/init.sql`, healthcheck pg_isready
- [x] Task 2: `kong-database` — postgres:16-alpine riêng, port 5433, healthcheck pg_isready
- [x] Task 3: `kong-migration` — kong/kong-gateway:3.9, `kong migrations bootstrap`, restart: on-failure
- [x] Task 4: `kong` — kong/kong-gateway:3.9, port 8000+8001, healthcheck `kong health`, start_period: 30s
- [x] Task 5: `config-api` — build ./config-api, port 8080, depends_on postgres(healthy)+kong(healthy)
- [x] Task 6: `mock-api-dest` — build ./mock-api-dest, port 8081
- [x] Task 7: `mock-kafka-config` — build ./mock-kafka-config, port 8082
- [x] Task 8: `mock-source` — profiles: ["test"], depends_on kong+config-api
- [x] Task 9: Network `poc-net` — tất cả 8 services
- [x] Task 10: `.env.example` — đầy đủ biến với comments

## Checklist hoàn thành

- [x] 8 services đúng spec bảng Phase 4
- [x] Kong healthcheck: `["CMD", "kong", "health"]`, interval 10s, timeout 5s, retries 5, start_period 30s
- [x] config-api depends_on: kong (service_healthy), postgres (service_healthy)
- [x] mock-source profiles: ["test"] — không tự chạy
- [x] kong-migration: restart: on-failure + depends_on kong-database (healthy) + `condition: service_completed_successfully`
- [x] init.sql mount: `./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro`
- [x] Tất cả services dùng network `poc-net`
- [x] `${VAR:-default}` syntax cho tất cả biến
- [x] Port mappings không conflict: 5432, 5433, 8000, 8001, 8080, 8081, 8082
- [x] Named volumes: `pgdata`, `kong-pgdata`

## Done When

- [x] `docker compose --env-file .env.example config --quiet` → **✅ VALID**
- [ ] `docker compose build` → verify khi Docker Desktop chạy
- [ ] `docker compose up -d` → tất cả services healthy
- [ ] E2E verify ở Plan 06
