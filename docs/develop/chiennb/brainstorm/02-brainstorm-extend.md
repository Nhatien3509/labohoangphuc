🤖 **Applying knowledge of `@[project-planner]`...**

Dựa trên kiến trúc `config-api` hiện tại trong `plan_main.md` (nơi mà mọi object của Kong đều được quản lý state thông qua PostgreSQL DB kèm Audit/History), tôi xin trình bày các phương án thiết kế để bổ sung API tạo Consumer và gắn plugin `key-auth`.

---

## 🧠 Brainstorm: Thêm API Quản lý Consumer & Key-Auth Plugin

### Context
Hệ thống hiện tại (`config-api`) đang đóng vai trò là "Source of Truth" cho việc cấu hình Route trên Kong (mọi thay đổi lưu DB -> gọi Kong API). 
Bây giờ, chúng ta cần bổ sung khả năng bảo mật cho các route này bằng cách:
1. Tạo Consumer (đại diện cho một ứng dụng/client gọi tới).
2. Cấp `key-auth` cho Consumer đó.
3. Gắn plugin `key-auth` vào Route để bắt buộc client phải truyền key khi gọi API.

---

### Option A: Stateful Management (Đồng bộ hoàn toàn với Database - Chuẩn kiến trúc hiện tại)
**Mô tả:** 
Tạo thêm các bảng trong PostgreSQL (`kong_consumers`, `kong_plugins`) để lưu trữ state. `config-api` sẽ đóng vai trò quản lý toàn diện.
- **Thêm API:**
  - `POST /api/v1/consumers`: Insert DB + Gọi Kong `POST /consumers`.
  - `POST /api/v1/consumers/{id}/key-auth`: Cấp key (lưu DB + gọi Kong `POST /consumers/{id}/key-auth`).
  - `POST /api/v1/route-configs/{id}/plugins`: Gắn plugin (ví dụ `name: key-auth`) vào Route (lưu DB + gọi Kong `POST /routes/{id}/plugins`).

✅ **Pros:**
- **Source of Truth vững chắc:** Mọi cấu hình (ai có key gì, route nào đang bật auth) đều có thể truy vấn dễ dàng từ DB nội bộ, không cần gọi nhiều request lên Kong Admin.
- **Audit & History:** Dễ dàng áp dụng cơ chế `history` và `audit` giống như đang làm với `kong_route_configs`.
- **Dễ quản lý lifecycle:** Dễ dàng revoke (thu hồi) key hoặc disable plugin từ Admin Dashboard sau này.

❌ **Cons:**
- **Effort cao nhất:** Phải viết thêm file migration (`init.sql`), tạo thêm Model, Repository, Service logic cho Consumer và Plugin.

📊 **Effort:** High

---

### Option B: Stateless Wrapper (Gọi trực tiếp Kong Admin API - Bỏ qua DB)
**Mô tả:** 
`config-api` chỉ làm nhiệm vụ "Bảo vệ" Kong Admin API. Ta không lưu state của Consumer hay Plugin vào PostgreSQL. Khi có request tạo, API chỉ parse data và forward trực tiếp lên Kong.
- **Thêm API:**
  - `POST /api/v1/proxy/consumers` -> Call Kong Admin.
  - `POST /api/v1/proxy/plugins` -> Call Kong Admin.

✅ **Pros:**
- **Code cực nhanh:** Chỉ cần thêm vài method trong `kong_client.go` và tạo Handler để pass-through, không đụng tới DB.
- Tránh được việc phải "sync" state giữa DB nội bộ và Kong DB.

❌ **Cons:**
- **Lệch pha kiến trúc:** Phá vỡ pattern "DB-first + Notify" hiện tại của `RouteConfig`.
- **Khó truy vấn:** Khi muốn biết "Route A đang bật những plugin gì", API phải gọi lên Kong Admin thay vì query DB nội tại, làm giảm tốc độ hiển thị cho UI sau này.

📊 **Effort:** Low

---

### Option C: Route-Centric (Tích hợp Plugin thẳng vào thuộc tính của Route)
**Mô tả:** 
Thay vì coi `Plugin` là một entity độc lập, ta coi nó là một "tính năng" của Route.
- **Thay đổi DB:** Thêm cột `enable_key_auth BOOLEAN` vào bảng `kong_route_configs`.
- **Logic:** 
  - Khi gọi `POST /api/v1/route-configs` với `"enable_key_auth": true`, service sẽ tự động gọi Kong `POST /routes/{id}/plugins` với name là `key-auth`.
  - Consumer và Key vẫn sẽ tạo qua API (có thể làm Stateless như Option B).

✅ **Pros:**
- Developer experience cực tốt khi tạo Route (1 API call tạo Route kèm bật Auth luôn).
- Ít bảng DB hơn Option A.

❌ **Cons:**
- Thiếu tính mở rộng: Nếu tương lai muốn thêm plugin `rate-limiting`, `ip-restriction`, `cors`... thì việc thêm cột BOOLEAN cho từng plugin sẽ làm phình to bảng DB.
- Vẫn phải xử lý rác cho Consumer API.

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option A (Stateful Management)** là lựa chọn tốt nhất. 

**Lý do:**
1. Nó tuân thủ nghiêm ngặt nguyên tắc thiết kế hiện tại của POC (Database as Source of Truth + Audit History).
2. Plugin của Kong là một hệ sinh thái lớn, việc tạo một bảng `kong_route_plugins` rời sẽ giúp hệ thống dễ dàng mở rộng sang các plugin khác (như Rate Limiting, ACL, CORS) sau này mà không cần sửa schema DB.
3. Consumer Keys liên quan mật thiết tới bảo mật, việc lưu trữ vào DB giúp bạn dễ dàng cấp phát lại, thu hồi hoặc trace log khi có sự cố.

**Các bước triển khai dự kiến nếu chọn Option A:**
1. Thêm script vào `db/init.sql` (bảng `kong_consumers`, `kong_consumer_keys`, `kong_route_plugins`).
2. Update `kong_client.go`: Thêm `CreateConsumer()`, `CreateConsumerKey()`, `AddPluginToRoute()`.
3. Tạo Service, Model, Handler tương ứng.
4. Cập nhật `plan_main.md`.

Bạn muốn triển khai theo **Option A** hay khám phá hướng tiếp cận nào khác?