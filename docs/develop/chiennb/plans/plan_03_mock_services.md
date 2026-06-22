# Plan 03: Mock Services

> **Parent:** [plan_main.md](file:///d:/Workspace/GTSC2026/26.dmst.c12.tichhopchiase/docs/kong/plans/plan_main.md) → Phase 3
> **Dependencies:** Plan 01 ✅, Plan 02 ✅
> **Output:** 3 mock services hoàn chỉnh
> **Status:** ✅ DONE

---

## Goal

Implement 3 mock services: `mock-api-dest`, `mock-kafka-config`, `mock-source`. Mỗi service là Go app đơn giản, độc lập, không phụ thuộc config-api.

---

## Task Group A: mock-api-dest (`:8081`)

- [x] Task A1: HTTP server lắng nghe `:8081`
- [x] Task A2: Catch-all handler `/*` — log request + echo body (JSON hoặc raw)
- [x] Task A3: `/health` → 200 OK + JSON status
- [x] Task A4: Log format: `timestamp | method | full_path | body_size | content-type | latency`
- [x] Task A5: Dockerfile multi-stage (giữ nguyên từ Plan 01)

## Checklist A ✅

- [x] Catch-all route nhận MỌI path — dùng `mux.HandleFunc("/", ...)`
- [x] Log hiển thị full path (strip_path=false)
- [x] Echo JSON body hoặc raw string nếu không phải JSON
- [x] Health check hoạt động

---

## Task Group B: mock-kafka-config (`:8082`)

- [x] Task B1: HTTP server lắng nghe `:8082`
- [x] Task B2: `POST /notify` — parse + log payload + 200 OK
- [x] Task B3: In-memory store (`sync.RWMutex`) — append, không overwrite
- [x] Task B4: `GET /notifications` — trả JSON array toàn bộ notifications
- [x] Task B5: `/health` → 200 OK + total_notifications count
- [x] Task B6: Log format: `event_type | system_code | action_code | route_path | upstream | ts`
- [x] Task B7: Dockerfile multi-stage (giữ nguyên từ Plan 01)

## Checklist B ✅

- [x] Parse NotifyPayload JSON đúng fields từ config-api
- [x] Thread-safe in-memory store (sync.RWMutex)
- [x] Log rõ ràng khi nhận notify

---

## Task Group C: mock-source

- [x] Task C1: Đọc 4 ENV vars với defaults đúng plan chính
- [x] Task C2: Send loop gửi TOTAL_MESSAGES POST requests
- [x] Task C3: Body merge: template + seq + trace_id (UUID v4) + timestamp + payload.order_id
- [x] Task C4: Log mỗi request: `seq | status_code | latency_ms`
- [x] Task C5: Log summary: `Done: X/Y success`
- [x] Task C6: Dockerfile multi-stage (giữ nguyên từ Plan 01)

## Checklist C ✅

- [x] ENV defaults: TARGET_URL, TOTAL_MESSAGES=50, INTERVAL_MS=500, BODY_TEMPLATE
- [x] UUID v4 tự implement không dùng thư viện ngoài (`crypto/rand`)
- [x] order_id format: `ORD-{date}-{seq:03d}`
- [x] Exit sau khi gửi xong
- [x] Lỗi HTTP: log + tiếp tục (không panic)

---

## Done When

- [x] Tất cả stdlib only — không external dependency
- [ ] Docker build verify ở Plan 05
- [ ] E2E verify ở Plan 06
