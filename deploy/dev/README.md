# Môi trường DEV để test local

Bộ này dựng Postgres (kèm schema + dữ liệu mẫu) khớp với cấu hình mặc
định của backend, để chạy thử toàn bộ luồng đăng nhập → tra cứu → phát hành thẻ.

## 1. Khởi động hạ tầng (Postgres)

```bash
cd deploy/dev
docker compose up -d
```

Lần đầu sẽ tự nạp `init/01-schema.sql` (schema đầy đủ + hàm `next_warranty_code`)
và `init/02-seed.sql` (tài khoản + dữ liệu mẫu).

- Postgres: `localhost:5434`, db `labo_warranty`, user `postgres`, pass `secret`

## 2. Chạy backend (Go)

```bash
cd labo-warranty
go run ./cmd/api        # lắng nghe http://localhost:8080
```

Không cần `.env` — config mặc định đã khớp bộ Docker trên.

## 3. Chạy frontend (Next.js)

```bash
cd web/portal-spa
cp .env.example .env.local      # BACKEND_URL=http://localhost:8080
npm install
npm run dev                     # http://localhost:3600
```

## Tài khoản & dữ liệu mẫu

| Mục | Giá trị |
|---|---|
| Đăng nhập admin | `admin@labo.vn` / `Admin@123` |
| Thẻ tra cứu sẵn | `BH-20260001` |

## Kịch bản test nhanh trên trình duyệt

1. `http://localhost:3600/tra-cuu` → nhập `BH-20260001` → hiện thông tin thẻ.
2. `http://localhost:3600/admin` → bị đẩy sang `/login` (middleware chặn).
3. Đăng nhập `admin@labo.vn` / `Admin@123` → vào được khu quản trị.
4. Vào **Thẻ bảo hành** → thấy danh sách → bấm **Phát hành thẻ**, nhập tên khách,
   SĐT, lab, số tháng bảo hành (mặc định 84), ngày, vị trí răng `24, 25` → tạo OK.
5. Header → **Đổi mật khẩu** / **Đăng xuất** để test 2 API còn lại.

## Nạp lại dữ liệu từ đầu

```bash
cd deploy/dev
docker compose down -v && docker compose up -d
```

## Test nhanh bằng curl (không cần FE)

```bash
B=http://localhost:8080/api/v1
curl -s $B/warranty/BH-20260001                       # tra cứu công khai
TOKEN=$(curl -s -X POST $B/auth/login -H 'content-type: application/json' \
  -d '{"email":"admin@labo.vn","password":"Admin@123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['access_token'])")
curl -s $B/admin/warranty-cards -H "Authorization: Bearer $TOKEN"   # danh sách thẻ
```
