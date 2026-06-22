# Brainstorm: Tích hợp Kong API & Điều phối luồng nghiệp vụ

## 1. Bối cảnh (Context)
Hệ thống cần xử lý một luồng gồm nhiều bước: `Go API -> Business Logic -> Kong Admin API -> PostgreSQL -> External API`. Thách thức cốt lõi là xử lý "lỗi bán phần" (partial failures) để tránh dữ liệu rác trên hệ thống chính cũng như trên Kong Gateway.

---

## 2. Các phương án kiến trúc cân nhắc

### Option A: Tiếp cận Đồng bộ (Synchronous / Monolithic Flow)
Go API thực thi chuỗi tuần tự kết hợp với hệ thống Context và bù trừ đồng bộ (Synchronous Compensation).

- **Pros:** Đơn giản, dễ cài đặt cho POC, dễ debug luồng tuyến tính.
- **Cons:** Phải xử lý logic Rollback nếu DB thất bại nhưng Kong đã tạo thành công; Response time phụ thuộc vào độ trễ của Kong.
- **Effort:** Low -> **Đề xuất cho giai đoạn POC.**

### Option B: Hàng đợi Bất đồng bộ (Kafka/MQ)
Lưu DB là PENDING, bắn Event qua Kafka, Worker xử lý gọi Kong và update trạng thái gốc.

- **Pros:** Scalable cực mạnh, Response time cho Client thấp.
- **Cons:** Infrastructure phức tạp, bù trừ ngược rắc rối.
- **Effort:** Medium -> Thích hợp cho Phase Enterprise.

### Option C: Saga Pattern (Temporal.io)
Dùng Workflow Engine quản lý chuỗi Actitivies và tự động Rollback (Compensate) nếu có activity bị fail.

- **Pros:** An toàn tuyệt đối, Built-in Retry.
- **Cons:** Overkill nặng nề với tính năng bé.
- **Effort:** High.

---

## 3. Kiến trúc sâu Phương án A (Đề xuất POC)

### 3.1. Luồng chạy tối ưu
1. **[DB - Tx Begin]** Lưu bản ghi với `status = 'PENDING'`. (Chưa commit)
2. **[Kong Client]** Gọi Kong Admin API tạo `Service`. Lấy về `kong_service_id`.
3. **[Kong Client]** Gọi Kong Admin API tạo `Route` (gắn vào Service trên). Lấy về `kong_route_id`.
4. **[DB - Tx Commit]** Cập nhật bản ghi thành `ACTIVE` kèm ID của Kong. **COMMIT**.
5. **[External API]** Gọi hàm notify/webhook (Fire & Forget, không gây lỗi ngược dòng chặn).

### 3.2. Cơ chế bù trừ rủi ro (Compensating)
Sử dụng `defer` trong Go để bẫy lỗi. Nếu **Bước 4 (Lưu DB/Commit) thất bại** (do rớt mạng DB, sai schema cấu trúc), defer logic sẽ kiểm tra cờ (isSuccess) và gọi logic **Xóa Service/Route** trên Kong (Rollback phía Kong) và **Rollback Database**. Đảm bảo không có Route rác sinh ra.

---

## 4. Thiết kế Cấu trúc Database (PostgreSQL)

### 4.1 Bảng nghiệp vụ lõi (`api_integrations`)

Bảng chịu trách nhiệm maping đường dẫn nội bộ và quản lý trạng thái.

| Trường dữ liệu | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | UUID/Serial | Khóa chính |
| `system_code` | VARCHAR | Mã hệ thống nguồn (VD: `ERP`, `DMS`) |
| `action_code` | VARCHAR | Tên/mã hành động (VD: `SYNC_DATA`) |
| `upstream_url` | VARCHAR | Đường dẫn link thật của API A đứng đằng sau |
| `route_path` | VARCHAR | Link Kong cấu hình `/api/v1/integration/{system_code}/{action_code}` |
| `kong_service_id` | UUID | Chìa khóa ID của Kong - Dùng để Update URL sau này |
| `kong_route_id` | UUID | Chìa khóa ID của Kong - Dùng để cấu hình đổi Route sau này |
| `status` | VARCHAR | Trạng thái đồng bộ (PENDING, ACTIVE, INACTIVE, FAILED) |

*(Khi cần lấy ra để cấu hình cập nhật, Load record từ CSDL ra sau đó gọi REST Kong thông qua `kong_service_id` hoặc `kong_route_id`)*.

### 4.2 Bảng Nhật ký sự kiện (`kong_audits`)

Bảng lưu vết (Audit) phục vụ dò tìm lỗi khi giao tiếp Kong Admin hỏng.

| Trường dữ liệu | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | UUID | Khóa chính |
| `api_integration_id` | UUID | ID của cấu hình API liên quan (nullable nếu ban đầu tạch) |
| `action_type` | VARCHAR | `CREATE_SERVICE`, `CREATE_ROUTE`, `UPDATE`, `DELETE` |
| `request_payload`| JSONB | JSON Gửi đi - Quan trọng để debug |
| `response_payload`| JSONB | JSON Nhận lại - Có báo lỗi BadRequest nếu sai config |
| `response_status`| INT | HTTP Code (201, 400, 409...) |
| `executed_by` | VARCHAR | Tên admin thực hiện / ID hệ thống |
| `created_at` | TIMESTAMPTZ | Ngày giờ ghi log |

---

## 5. Kịch bản Mockup phục vụ POC

### Mock API A (Hệ thống tiếp nhận cuối)
- Đây là API thực sự sẽ nhận Data khi người dùng gọi từ ngoài Gateway vào trong.
- **Kịch bản:** Sẽ dựng 1 endpoint nội bộ đơn giản (bắn ra 1 text/json giả). Kong sẽ điều phối url `/api/v1/integration/[sys]/[action]` trúng đích tới Mock API A này.
- **Vấn đề cần quyết định phiên sau:** URL sau khi chuyển tiếp từ Kong có cần phải Bỏ Đường Dẫn (Strip Path) không?

### Mock API B (Hệ thống thông báo đồng bộ)
- Là API thụ động đứng ngoài.
- **Kịch bản:** Khi hệ thống Go-Auth-API tạo Route thành công và lưu DB thành công (chạm mốc Commit). Sớm có một Goroutine tách riêng (`go callApiB()`) đẩy tín hiệu (Webhook) báo cho API B là "Đã cấu trúc thành công route cho hệ thống SysX".

---

## 6. Socratic Gate (Open Questions cho phiên làm việc tiếp)

1. **Bố trí Mock API:** Hệ thống Mock A và Mock B sẽ được cài chung chung vào cục `adm-srv-go-api` trong nhánh code test, hay dựng ra 1 image docker ảo tách biệt kiểu `wiremock`?
2. **Kong Strip Path:** Hệ thống Upstream A phía trong khi tiếp nhận request sẽ muốn nhìn thấy đoạn đường dẫn "/api/v1/..." hay nó muốn đón đường dẫn gốc (strip_path)?
3. **Database Migration:** Dự kiến sẽ tạo sẵn bảng qua File `.sql` hay chạy GORM AutoMigration mỗi khi dựng app lên?
