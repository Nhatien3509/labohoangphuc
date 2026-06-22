# Plan 06: E2E Testing — Kiểm chứng End-to-End

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 5
> **Dependencies:** Plan 05 (Docker Compose — toàn bộ stack phải chạy)
> **Output:** Kết quả test + script test có thể tái sử dụng

---

## Goal

Kiểm chứng toàn bộ luồng POC hoạt động đúng: tạo route → Kong sync → proxy request → notify → rollback.

## Pre-conditions

- [ ] `docker compose up -d` — tất cả services healthy
- [ ] `curl localhost:8001/status` → Kong 200
- [ ] `curl localhost:8080/health` → config-api 200
- [ ] `curl localhost:8081/health` → mock-api-dest 200
- [ ] `curl localhost:8082/health` → mock-kafka-config 200

---

## Test Scenario 1: Tạo Route Config (Happy Path)

- [ ] Step 1: POST `/api/v1/route-configs` tạo route ERP/SYNC_DATA
  → Verify: response `201 Created`, `status=ACTIVE`, `kong_service_id` != null, `kong_route_id` != null

- [ ] Step 2: Verify route trên Kong Admin API
  → Verify: `GET localhost:8001/routes` → có route với path `/api/v1/integration/ERP/SYNC_DATA`

- [ ] Step 3: Verify service trên Kong Admin API
  → Verify: `GET localhost:8001/services` → có service trỏ tới `http://mock-api-dest:8081`

- [ ] Step 4: Verify notify đến mock-kafka-config
  → Verify: `docker compose logs mock-kafka-config` → log chứa `ROUTE_CREATED`, `ERP`, `SYNC_DATA`

- [ ] Step 5: Gửi request qua Kong proxy
  → Verify: `POST localhost:8000/api/v1/integration/ERP/SYNC_DATA` → `200 OK` from mock-api-dest

- [ ] Step 6: Verify mock-api-dest nhận đúng request
  → Verify: `docker compose logs mock-api-dest` → log chứa full path `/api/v1/integration/ERP/SYNC_DATA`

## Checklist Scenario 1

- [ ] Route path sinh tự động đúng format
- [ ] Kong service + route tạo thành công
- [ ] Proxy forward request đúng upstream
- [ ] `strip_path=false` → mock-api-dest nhận full path
- [ ] Notification gửi async thành công

---

## Test Scenario 2: List & Get Route Configs

- [ ] Step 1: GET `/api/v1/route-configs` → danh sách configs
  → Verify: response `200`, array chứa ít nhất 1 item (từ Scenario 1)

- [ ] Step 2: GET `/api/v1/route-configs/{id}` → chi tiết config
  → Verify: response `200`, data khớp với item đã tạo

- [ ] Step 3: GET `/api/v1/route-configs/{id}/history` → lịch sử
  → Verify: response `200`, có 1 entry `change_type=CREATE`

---

## Test Scenario 3: Update Route Config

- [ ] Step 1: PUT `/api/v1/route-configs/{id}` → update `upstream_url` thành URL mới
  → Verify: response `200`, `upstream_url` thay đổi

- [ ] Step 2: Verify Kong service updated
  → Verify: `GET localhost:8001/services/{kong_service_id}` → `url` thay đổi

- [ ] Step 3: Verify history ghi nhận
  → Verify: GET history → có entry `change_type=UPDATE`

---

## Test Scenario 4: Rollback

- [ ] Step 1: POST `/api/v1/route-configs/{id}/rollback`
  → Verify: response `200`, `upstream_url` quay lại giá trị ban đầu

- [ ] Step 2: Verify Kong service rollback
  → Verify: `GET localhost:8001/services/{kong_service_id}` → `url` quay lại `http://mock-api-dest:8081`

- [ ] Step 3: Verify history
  → Verify: GET history → có entry `change_type=ROLLBACK`

- [ ] Step 4: Gửi request qua Kong → vẫn proxy đúng
  → Verify: `POST localhost:8000/api/v1/integration/ERP/SYNC_DATA` → `200 OK`

---

## Test Scenario 5: Delete Route Config

- [ ] Step 1: DELETE `/api/v1/route-configs/{id}`
  → Verify: response `200` hoặc `204`

- [ ] Step 2: Verify Kong route đã bị xóa
  → Verify: `GET localhost:8001/routes` → không còn route với path cũ

- [ ] Step 3: Gửi request qua Kong → 404
  → Verify: `POST localhost:8000/api/v1/integration/ERP/SYNC_DATA` → `404 Not Found`

---

## Test Scenario 6: mock-source Batch Send

- [ ] Step 1: `docker compose --profile test up mock-source`
  → Verify: mock-source gửi 50 messages

- [ ] Step 2: Verify mock-api-dest nhận 50 requests
  → Verify: `docker compose logs mock-api-dest | grep "POST" | wc -l` = 50

- [ ] Step 3: Verify mock-source log summary `Done: 50/50 success`
  → Verify: `docker compose logs mock-source` → chứa summary line

> [!IMPORTANT]
> Scenario 6 yêu cầu route ERP/SYNC_DATA đã được tạo trước đó. Chạy Scenario 1 trước hoặc tạo lại route.

---

## Test Scenario 7: Error Cases

- [ ] Step 1: POST duplicate route config (cùng version/app/system_code/action_code)
  → Verify: response `409 Conflict` hoặc `400 Bad Request`

- [ ] Step 2: GET route config không tồn tại
  → Verify: response `404 Not Found`

- [ ] Step 3: Rollback khi không có history
  → Verify: response `400` hoặc `404` với error message rõ ràng

---

## Done When

- [ ] 7 test scenarios pass (hoặc ghi nhận known issues)
- [ ] Full flow: Create → Proxy → Update → Rollback → Delete → hoạt động đúng
- [ ] mock-source batch send thành công
- [ ] Error cases trả response hợp lý
- [ ] Kết quả test được ghi lại (screenshot/log)
