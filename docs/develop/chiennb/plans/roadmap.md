# ROADMAP: POC Kong Integration

> **Source:** Tổng hợp từ `plan_01` → `plan_06` + `plan_main.md` + Mở rộng Kong Auth & Upsert  
> **Stack:** Kong 3.6 · Go 1.23 · PostgreSQL 16 · Docker Compose  
> **Scope:** Đã tích hợp hoàn toàn vào `srcs/dmst-admin-api/` (Monolith)  
> **Cập nhật lần cuối:** 2026-04-27 (Sau khi hoàn tất E2E Test)

---

## Tiến độ tổng thể

| Phase | Plan | Nội dung | Status | Progress |
|-------|------|---------|--------|----------|
| 0 | [plan_01](plan_01_scaffolding.md) | Scaffolding — File structure | ✅ DONE | 100% |
| 1 | [plan_02](plan_02_database.md) | Database — AutoMigrate via GORM | ✅ DONE | 100% |
| 2 | [plan_04](plan_04_config_api.md) | config-api — Tích hợp vào dmst-admin-api | ✅ DONE | 100% |
| 3 | [plan_03](plan_03_mock_services.md) | Mock Services | ❌ REMOVED | 0% (Hủy bỏ) |
| 4 | [plan_05](plan_05_docker_compose.md) | Docker Compose | ✅ DONE | 100% |
| 5 | [plan_06](plan_06_e2e_testing.md) | E2E Testing — 7 scenarios + Auth + Upsert | ✅ DONE | 100% |

**Overall:** `██████████` 100% (Hoàn thành tích hợp)

---

## Chi tiết các tính năng mới bổ sung (Giai đoạn 2)

### ✅ Kong Auth Flow (Consumer / API Key / Plugin)
- **Plan:** [PLAN-kong-auth-consumer.md](PLAN-kong-auth-consumer.md)
- **Nội dung:** Cấp API Key, bảo vệ Route qua plugin `key-auth` và quản lý Consumer Stateful.
- **Tình trạng:** Đã hoàn thành & Đã verify E2E (Status 401 khi thiếu key, 200 khi đúng key).

### ✅ Kong Upsert Fallback
- **Plan:** [PLAN-kong-upsert.md](PLAN-kong-upsert.md)
- **Nội dung:** Cơ chế tự động fallback POST → PATCH khi gặp lỗi `409 Conflict` trên Kong Admin API.
- **Tình trạng:** Đã hoàn thành & Đã verify E2E thành công.

---

## Chi tiết từng Phase đã triển khai

### ✅ Phase 1 — Database
- Đã chuyển từ chạy `init.sql` thủ công sang sử dụng **GORM AutoMigrate** tự động khởi tạo khi app boot.

### ✅ Phase 2 — config-api
- Đã hợp nhất mã nguồn vào monolith `dmst-admin-api`.

### ❌ Phase 3 — Mock Services
- Đã hủy bỏ hoàn toàn các project mock (`mock-api-dest`, `mock-kafka-config`, `mock-source`).

### ✅ Phase 5 — E2E Testing
- Đã kiểm thử thành công toàn bộ kịch bản tích hợp Gateway.

---

## Links
| Tài liệu | Mô tả |
|---------|-------|
| [plan_main.md](plan_main.md) | Kế hoạch tổng thể đã cập nhật |
| [PLAN-kong-auth-consumer.md](PLAN-kong-auth-consumer.md) | Thiết kế & Test kịch bản Auth |
| [PLAN-kong-upsert.md](PLAN-kong-upsert.md) | Thiết kế & Test kịch bản Upsert |
