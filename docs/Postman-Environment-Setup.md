# Postman Environment Setup — DMST Admin Panel

Tài liệu hướng dẫn cấu hình Postman environments (DEV & DEMO) cho bộ API collection.

---

## Tác vụ

2 environment files có sẵn:

| File | Host | Mô tả |
|------|------|-------|
| `dmst-admin-panel.postman_environment-dev.json` | 160.191.32.224 | Development environment |
| `dmst-admin-panel.postman_environment-demo.json` | 160.191.32.193 | Demo/Test environment |

---

## Cách Import Environment

### Cách 1: Import qua UI Postman

1. Mở Postman → Click nút **Environments** bên trái
2. Click **Import** (hoặc **+** → **File**)
3. Chọn file `dmst-admin-panel.postman_environment-dev.json` hoặc `dmst-admin-panel.postman_environment-demo.json`
4. Click **Import**

### Cách 2: Drag & Drop

1. Drag file environment vào Postman
2. Postman tự động import

---

## Chọn Environment Khi Chạy

Sau khi import, ở góc trên bên phải Postman:

```
[No Environment ▼]  →  Chọn → [DEV] hoặc [DEMO]
```

Tất cả biến sẽ tự động thay đổi theo environment được chọn.

---

## Biến trong Environment

### Base URLs (thay đổi theo environment)

| Biến | DEV (160.191.32.224) | DEMO (160.191.32.193) |
|------|----------------------|----------------------|
| `base_adm` | http://160.191.32.224:9080 | http://160.191.32.193:9080 |
| `base_ingest` | http://160.191.32.224:9181 | http://160.191.32.193:9181 |
| `base_mock` | http://160.191.32.224:8090 | http://160.191.32.193:8090 |
| `base_kafka_ui` | http://160.191.32.224:8190 | http://160.191.32.193:8190 |
| `base_signoz` | http://160.191.32.224:3301 | http://160.191.32.193:3301 |
| `base_flink` | http://160.191.32.224:8181 | http://160.191.32.193:8181 |
| ... | ... | ... |

### Biến không đổi (giống ở cả DEV & DEMO)

```
signoz_email = admin@dmst.local
signoz_password = Abcd@123456
kafka_cluster = dmst-integration-cluster
consumer_group = flink-job5-gtsc-ingest
... (và nhiều biến khác)
```

---

## Sử dụng

### 1. Health Check (trước tiên)

```
Postman → 00 - Health Checks → Run Collection
```

Verify tất cả services đang chạy.

### 2. Login SigNoz

```
Postman → 05 - SigNoz Observability → Auth → Login
```

Lấy JWT token, tự động lưu vào `{{signoz_token}}`.

### 3. Chạy API

```
Postman → Chọn folder → Chạy request
```

Ví dụ:
- Tạo datasource: `02 - Ingest Service → Datasources → Create`
- Trigger job: `02 - Ingest Service → Jobs → Trigger Pull`
- Xem logs SigNoz: `05 - SigNoz Observability → Logs → All Services`

---

## Giải Quyết Vấn Đề

### "Environment không thay đổi"

1. Đảm bảo environment được **selected** ở góc trên bên phải
2. Click environment name → xác nhận biến hiển thị đúng giá trị

### "API trả về 404 / Connection refused"

1. Kiểm tra environment được chọn đúng (DEV vs DEMO)
2. Verify services đang chạy: chạy `00 - Health Checks`
3. Check biến `base_*` có IP đúng không: `Environment → Click environment → View values`

### "Login SigNoz failed"

1. Verify `signoz_email` & `signoz_password` đúng
2. Verify `base_signoz` có port 3301 đúng không
3. Kiểm tra SigNoz container chạy: `docker ps | grep signoz`

---

## File đính kèm

```
docs/
├── dmst-admin-panel.postman_collection.json               ← Collection (API endpoints)
├── dmst-admin-panel.postman_environment-dev.json          ← Environment DEV
├── dmst-admin-panel.postman_environment-demo.json         ← Environment DEMO
└── Postman-Environment-Setup.md                           ← File này
```

---

## Thêm/Sửa Biến

Nếu muốn sửa biến trong Postman:

1. Click **Environments** bên trái
2. Click tên environment (DEV hoặc DEMO)
3. Sửa giá trị ô **Initial Value** hoặc **Current Value**
4. Ctrl+S (Postman tự động lưu)

---

## Tạo Environment Mới (Tuỳ chọn)

Nếu cần environment mới (e.g., STAGING, PROD):

1. Postman → **Environments** → **+**
2. Tên: `STAGING`
3. Copy tất cả biến từ DEV hoặc DEMO
4. Thay đổi IP thành IP STAGING
5. Ctrl+S → xong

Hoặc dùng script Node để generate environment file:

```bash
node gen_env.js STAGING 160.191.32.XXX
```

---

**Hỗ trợ:** Nếu gặp vấn đề, check SigNoz UI hoặc logs services để debug.
