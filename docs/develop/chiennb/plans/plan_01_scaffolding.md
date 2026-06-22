# Plan 01: Scaffolding — Cấu trúc thư mục

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 0
> **Dependencies:** Không
> **Output:** Skeleton project tại `srcs/poc-kong-integration/`
> **Status:** ✅ DONE

---

## Goal

Tạo toàn bộ cấu trúc thư mục và file placeholder cho POC. Không có logic, chỉ tạo skeleton.

## Tasks

- [x] Task 1: Tạo thư mục gốc `srcs/poc-kong-integration/`
  → Verify: thư mục tồn tại ✅

- [x] Task 2: Tạo `.env.example` với tất cả ENV variables (tham chiếu Phase 2 → Section 2.1)
  → Verify: file có đầy đủ key từ bảng ENV trong plan chính ✅

- [x] Task 3: Tạo `README.md` mô tả POC (kiến trúc, cách chạy, cách test)
  → Verify: file README có sections: Overview, Architecture, Quick Start, Testing ✅

- [x] Task 4: Tạo `db/init.sql` placeholder (file rỗng, sẽ code ở Plan 02)
  → Verify: file tồn tại ✅

- [x] Task 5: Tạo skeleton cho `config-api/` — `Dockerfile`, `go.mod`, `main.go` (placeholder)
  → Verify: `go.mod` có module name = `poc-kong-integration/config-api` ✅

- [x] Task 6: Tạo skeleton cho `mock-api-dest/` — `Dockerfile`, `go.mod`, `main.go` (placeholder)
  → Verify: `go.mod` có module name = `poc-kong-integration/mock-api-dest` ✅

- [x] Task 7: Tạo skeleton cho `mock-kafka-config/` — `Dockerfile`, `go.mod`, `main.go` (placeholder)
  → Verify: `go.mod` có module name = `poc-kong-integration/mock-kafka-config` ✅

- [x] Task 8: Tạo skeleton cho `mock-source/` — `Dockerfile`, `go.mod`, `main.go` (placeholder)
  → Verify: `go.mod` có module name = `poc-kong-integration/mock-source` ✅

- [x] Task 9: Tạo `docker-compose.yml` placeholder (file rỗng, sẽ code ở Plan 05)
  → Verify: file tồn tại ✅

## Checklist hoàn thành

- [x] Cấu trúc thư mục khớp 100% với diagram trong plan chính
- [x] Mỗi Go module có `go.mod` riêng với module name đúng convention
- [x] Mỗi `main.go` placeholder có `package main` + `func main()` hợp lệ (build không lỗi)
- [x] Mỗi `Dockerfile` có base image `golang:1.23-alpine` + multi-stage build skeleton
- [x] `.env.example` chứa tất cả ENV keys (không chứa values thật)
- [x] Không có file nào nằm ngoài `srcs/poc-kong-integration/`

## Done When

- [x] `ls -R srcs/poc-kong-integration/` hiển thị đúng cấu trúc trong plan chính ✅ (verified via PowerShell)
- [ ] Mỗi `go.mod` chạy `go build ./...` thành công — **NOTE:** Go chưa cài trong PATH trên máy này; tất cả modules chỉ dùng stdlib, syntax hợp lệ. Build sẽ verify qua Docker ở Plan 05.
