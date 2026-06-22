# Plan 02: Database — `db/init.sql`

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 1
> **Dependencies:** Plan 01 (Scaffolding) ✅
> **Output:** File `srcs/poc-kong-integration/db/init.sql` hoàn chỉnh
> **Status:** ✅ DONE

---

## Goal

Tạo schema SQL cho 3 bảng + indexes. File này sẽ được mount vào PostgreSQL container qua `docker-entrypoint-initdb.d`.

## Tasks

- [x] Task 1: Viết `CREATE TABLE kong_route_configs` với đầy đủ columns và constraints
  → Verify: SQL syntax valid, có UNIQUE constraint `(version, app, system_code, action_code)` ✅

- [x] Task 2: Viết `CREATE TABLE kong_route_config_history` với FK reference tới `kong_route_configs(id)`
  → Verify: FK constraint đúng, `config_version INT NOT NULL` có mặt ✅

- [x] Task 3: Viết `CREATE TABLE kong_audits`
  → Verify: JSONB columns cho `request_payload`, `response_payload` ✅

- [x] Task 4: Viết 4 indexes bổ sung
  → Verify: idx_kong_route_configs_status, idx_kong_route_configs_system, idx_history_config_id, idx_audits_config_id ✅

## Checklist hoàn thành

- [x] 3 bảng: `kong_route_configs`, `kong_route_config_history`, `kong_audits`
- [x] UUID primary keys dùng `gen_random_uuid()` (PostgreSQL 13+ built-in)
- [x] `TIMESTAMPTZ` cho tất cả timestamp columns
- [x] UNIQUE constraint `uq_route_config(version, app, system_code, action_code)`
- [x] FK từ `kong_route_config_history.kong_route_config_id` → `kong_route_configs(id)`
- [x] 4 indexes đúng tên khớp plan chính
- [x] Không có `DROP TABLE` hay `IF EXISTS`
- [x] `COMMENT ON TABLE/COLUMN` cho tất cả bảng và columns quan trọng

## Done When

- [ ] `docker exec postgres psql -U postgres -d kong_poc -c '\dt'` → 3 bảng — **verify khi Plan 05 chạy**
- [ ] `docker exec postgres psql -U postgres -d kong_poc -c '\di'` → 4 indexes — **verify khi Plan 05 chạy**
