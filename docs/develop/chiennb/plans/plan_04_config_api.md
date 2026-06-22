# Plan 04: config-api — Core Go API Service

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 2
> **Dependencies:** Plan 01 ✅, Plan 02 ✅
> **Output:** Service `config-api` hoàn chỉnh
> **Status:** ✅ DONE

---

## Task Group A: Foundation ✅

- [x] A1: `internal/config/config.go` — 10 ENV vars với defaults từ plan chính
- [x] A2: `pkg/retry/retry.go` — generic retry, exponential backoff, context-aware
- [x] A3: `go.mod` — GORM v1.25.12, uuid v1.6.0, postgres driver v1.5.9

**Checklist A:**
- [x] ENV defaults khớp plan Section 2.1
- [x] Retry: MaxRetries, InitialDelay, MaxDelay, BackoffFactor
- [x] Context cancellation support
- [x] Exponential backoff với cap tại MaxDelay

---

## Task Group B: Model + Repository ✅

- [x] B1: `internal/model/kong_route_config.go` — GORM tags khớp SQL schema
- [x] B2: `internal/model/kong_route_config_history.go`
- [x] B3: `internal/repository/route_config_repo.go` — Create, FindByID, FindAll, Update, UpdateNotifyStatus, Delete, WithTx
- [x] B4: `internal/repository/history_repo.go` — Create, FindByConfigID, FindLatestByConfigID, FindPreviousByConfigID, NextVersion

**Checklist B:**
- [x] GORM tags khớp SQL schema
- [x] UUID dùng `github.com/google/uuid`
- [x] Pointer cho nullable fields
- [x] Dependency injection qua constructor
- [x] KHÔNG dùng AutoMigrate
- [x] TableName() override cho cả 2 models

---

## Task Group C: Kong Client ✅

- [x] C1-C5: `internal/service/kong_client.go` — 6 methods đầy đủ
  - CreateService, CreateRoute, UpdateService, UpdateRoute, DeleteService, DeleteRoute

**Checklist C:**
- [x] stdlib net/http, timeout 10s
- [x] Base URL từ config
- [x] Log request/response
- [x] Error parsing khi status != 2xx
- [x] DELETE 204 No Content handled

---

## Task Group D: Notifier ✅

- [x] D1-D3: `internal/service/notifier.go` — async goroutine, retry.Do, update DB status

**Checklist D:**
- [x] Goroutine async — không block
- [x] Context với 5-minute timeout
- [x] Update notify_status SENT/FAILED
- [x] NotifyWithEvent() cho UPDATE/ROLLBACK events

---

## Task Group E: Route Config Service ✅

- [x] E1-E7: `internal/service/route_config_svc.go`
  - CreateRouteConfig (9 bước + compensate)
  - GetRouteConfig, ListRouteConfigs
  - UpdateRouteConfig + history
  - DeleteRouteConfig (route → service)
  - RollbackRouteConfig (previous version)
  - GetHistory

**Checklist E:**
- [x] Route path: `/api/{version}/{app}/{system_code}/{action_code}`
- [x] DB Transaction bao quanh create flow
- [x] Compensate defer: xóa Kong service nếu fail
- [x] History: config_version tăng dần, snapshot_data JSON
- [x] Notify async sau commit
- [x] Rollback: FindPreviousByConfigID trước khi rollback

---

## Task Group F: Handler + Router ✅

- [x] F1: `internal/handler/health.go` — HealthHandler + writeJSON/writeError helpers
- [x] F2: `internal/handler/route_config_handler.go` — 7 handler methods cho 8 endpoints
- [x] F3: `main.go` — wire deps, Go 1.22+ stdlib router, DB retry 10 lần, log middleware
- [x] F4: `Dockerfile` — multi-stage, git, go.sum*, trimpath

**Checklist F:**
- [x] 8 endpoints khớp plan Section 2.6
- [x] HTTP status: 201 (create), 200 (get/update/delete/rollback), 404, 400, 500
- [x] Error format: `{"error": "message"}`
- [x] Go 1.22+ PathValue("id")
- [x] Log middleware mọi request

---

## Done When

- [x] Tất cả 14 files được tạo
- [ ] `docker build` verify ở Plan 05
- [ ] E2E verify ở Plan 06
