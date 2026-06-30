# Deploy lên Vibe Hosting (Mắt Bão)

Ứng dụng gồm **2 service** (chạy Docker) + **1 PostgreSQL quản lý**:

| Thành phần | Deploy bằng | Cổng |
|---|---|---|
| Backend Go (API) | `Dockerfile.backend` (ở root repo) | 8080 |
| Frontend Next.js | `Dockerfile.frontend` (ở root repo) | 3600 |
| PostgreSQL | Dịch vụ **PostgreSQL quản lý** của Mắt Bão | — |

> Gói **Starter (2 service)** vừa đủ: 1 slot cho Backend, 1 slot cho Frontend. Postgres là dịch vụ DB riêng, không tính vào slot. (Đã bỏ Redis nên không cần slot thứ 3.)

---

## Bước 0 — Đẩy code lên GitHub
Đảm bảo repo đã có `Dockerfile.backend`, `Dockerfile.frontend`, `.dockerignore` ở thư mục gốc (đã tạo sẵn). Push lên GitHub (repo public hoặc private — Vibe Hosting kết nối được cả hai qua OAuth).

## Bước 1 — Tạo PostgreSQL quản lý
Trong dashboard Mắt Bão, tạo một **PostgreSQL**. Ghi lại:
`HOST`, `PORT` (thường 5432), `DATABASE`, `USER`, `PASSWORD`, và có bắt buộc **SSL** không.

> Không cần tạo bảng tay — backend tự tạo toàn bộ schema khi khởi động lần đầu.

## Bước 2 — Tạo Service **Backend**
- Nguồn: kết nối GitHub repo.
- Dockerfile: **`Dockerfile.backend`**, build context = **thư mục gốc repo**.
- Cổng (container/expose): **8080**.
- Biến môi trường:

  | Biến | Giá trị |
  |---|---|
  | `DB_HOST` | host Postgres quản lý |
  | `DB_PORT` | `5432` (theo Postgres của bạn) |
  | `DB_USER` | user Postgres |
  | `DB_PASSWORD` | mật khẩu Postgres |
  | `DB_NAME` | tên database |
  | `DB_SSL_MODE` | `require` nếu DB bắt buộc SSL, ngược lại `disable` |
  | `JWT_SECRET` | chuỗi ngẫu nhiên dài (`openssl rand -base64 48`) |
  | `SEED_ADMIN_EMAIL` | email admin, vd `admin@labo.vn` |
  | `SEED_ADMIN_PASSWORD` | mật khẩu admin (đổi ngay sau lần đăng nhập đầu) |

- Deploy. Xem log thấy:
  - `-> [PostgreSQL]: Kết nối thông suốt`
  - `-> [Seed Admin]: đã tạo tài khoản admin ...`
  - `-> [Gin Server]: Đang lắng nghe ... :8080`
- **Ghi lại URL của service Backend** (vd `https://labo-be-xxxx.vibehosting...`). Cần cho bước sau.

## Bước 3 — Tạo Service **Frontend**
- Nguồn: cùng GitHub repo.
- Dockerfile: **`Dockerfile.frontend`**, build context = **thư mục gốc repo**.
- Cổng (container/expose): **3600**.
- Biến môi trường:

  | Biến | Giá trị |
  |---|---|
  | `BACKEND_URL` | URL service Backend ở Bước 2 (vd `https://labo-be-xxxx...`) — **không kèm `/api/v1`** |

  > Nếu Vibe Hosting có mạng nội bộ giữa các service, ưu tiên URL nội bộ; nếu không, dùng URL công khai của Backend cũng chạy (FE gọi BE ở phía server nên không dính CORS).

- Deploy. URL của service Frontend chính là **trang web công khai**.

## Bước 4 — Gắn tên miền
Trỏ **tên miền đã đăng ký** vào **service Frontend** (phần Domain của Vibe Hosting hoặc cấu hình DNS theo hướng dẫn Mắt Bão).

## Bước 5 — Kiểm tra
1. Mở tên miền → trang chủ + danh sách sản phẩm hiện ra.
2. `/tra-cuu` → nhập một mã thẻ → ra thông tin bảo hành.
3. `/login` → đăng nhập bằng `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → vào khu admin.
4. **Đổi mật khẩu admin** ngay trong khu quản trị.

---

## Ghi nhớ
- **Schema tự tạo** khi backend khởi động (không cần migration thủ công).
- **Admin tự tạo** từ `SEED_ADMIN_*` (idempotent — deploy lại không reset mật khẩu đã đổi).
- **Bảo mật**: đặt `JWT_SECRET` ngẫu nhiên thật; đừng để mật khẩu admin mặc định.
- **Cổng**: nếu Vibe Hosting tự tiêm biến `PORT`, backend tự hiểu (đã hỗ trợ `PORT`), frontend (Next standalone) cũng tự hiểu `PORT`.
- Mỗi lần push code mới lên GitHub, Vibe Hosting tự build lại service tương ứng.

## Test trước ở máy/VPS (tùy chọn)
Chạy nguyên stack bằng Docker Compose để kiểm tra trước khi lên Vibe Hosting:
```bash
cd deploy
cp .env.production.example .env   # sửa mật khẩu, JWT_SECRET...
docker compose up -d --build
# Frontend: http://localhost:3600   Backend: http://localhost:8080
```

## Sự cố thường gặp
| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| Backend log `không thể kết nối đến Database` | Sai `DB_HOST/PORT/USER/PASSWORD/NAME` hoặc thiếu `DB_SSL_MODE=require` |
| Trang tra cứu báo lỗi gọi API | `BACKEND_URL` sai hoặc thiếu (đừng kèm `/api/v1`) |
| Không đăng nhập được admin | Chưa set `SEED_ADMIN_*` ở service Backend, xem lại log `[Seed Admin]` |
