# RUNBOOK: Vận hành & Triển khai Kong Integration

Tài liệu này hướng dẫn cách chuẩn bị cơ sở dữ liệu, deploy ứng dụng, vận hành hàng ngày và dọn dẹp dữ liệu thử nghiệm cho module tích hợp Kong (`dmst-admin-api`).

---

## 🛠️ 1. Điều kiện tiên quyết (Prerequisites)
Đảm bảo bạn có quyền truy cập SSH vào máy chủ:
- Máy chủ API, Database & Kafka (`160.191.32.224`)

---

## 🏗️ 2. Khởi tạo Database (BƯỚC BẮT BUỘC)

Hệ thống sử dụng GORM AutoMigrate để tạo bảng nhưng **không thể tự tạo Logical Database** nếu nó chưa tồn tại.

### Bước 1: SSH vào server (`160.191.32.224`) hoặc chạy từ xa:
```bash
ssh -i ~/.ssh/dmst_key.pem almalinux@160.191.32.224
```


### Bước 2: Tạo Logical Database thủ công
Chạy lệnh trực tiếp thông qua Docker container chứa PostgreSQL (`postgres-portal`):
```bash
docker exec -it postgres-portal psql -U postgres -c 'CREATE DATABASE "DMST_Integration_DB";'
```

> [!CAUTION]
> Bắt buộc phải bọc tên DB `"DMST_Integration_DB"` trong dấu nháy kép để giữ đúng định dạng chữ hoa/chữ thường. Nếu không có bước này, ứng dụng sẽ crash-loop với lỗi `database does not exist`.

---

## 🚀 3. Triển khai Ứng dụng (Deploy / Update)

Tùy thuộc vào quy trình CI/CD bạn chọn:

### Phương án A: Deploy qua CI/CD Script (Khuyến nghị)
```bash
cd deploy/scripts/ci
./deploy.sh config dev v0.0.1-chiennb
```

### Phương án B: Chạy thủ công qua Docker Compose
1. Đảm bảo cấu hình file `.env` tại máy chủ đích (`/home/almalinux/thcs/config/.env`) trỏ đúng IP DB.
2. Restart container:
```bash
docker compose -f /home/almalinux/thcs/config/docker-compose.yml up -d --build poc-config-api
```

---

## 🔍 4. Xác minh trạng thái hoạt động (Health Checks)

1. **Kiểm tra API Server:**
   ```bash
   curl http://160.191.32.224:9080/health
   ```
2. **Kiểm tra GORM Migrations:**
   Đăng nhập vào DB để xác nhận bảng đã tạo:
   ```bash
   docker exec -it postgres-portal psql -U postgres -d DMST_Integration_DB -c "\dt"
   ```
3. **Kiểm tra Kong connectivity:**
   ```bash
   curl http://160.191.32.224:8001/services
   ```

---

## 🧹 5. Dọn dẹp dữ liệu Test (Cleanup)

Sau khi hoàn tất quá trình kiểm thử, bạn có thể dọn dẹp hệ thống bằng 3 cách:

### Phương án 1: Dọn dẹp thủ công qua Admin API
Xóa từng `Route Config` đã tạo. Hệ thống sẽ tự động cascade xóa Service & Route tương ứng trên Kong:
```bash
curl -X DELETE http://160.191.32.224:9080/api/v1/route-configs/{route_config_id}
```

### Phương án 2: Dọn dẹp Trực tiếp qua Kong Admin API
Nếu không muốn dọn qua API ứng dụng, dùng `curl` quét sạch cấu hình của Kong:
```bash
# Xóa sạch Plugin
curl http://160.191.32.224:8001/plugins | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://160.191.32.224:8001/plugins/{}

# Xóa sạch Routes
curl http://160.191.32.224:8001/routes | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://160.191.32.224:8001/routes/{}

# Xóa sạch Services
curl http://160.191.32.224:8001/services | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://160.191.32.224:8001/services/{}

# Xóa Consumers
curl http://160.191.32.224:8001/consumers | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://160.191.32.224:8001/consumers/{}
```

### Phương án 3: Reset hoàn toàn qua decK (Khuyên dùng)
Nếu hệ thống có cài đặt decK CLI:
```bash
# Backup cấu hình hiện tại trước khi reset
deck gateway dump --kong-addr http://160.191.32.224:8001 -o kong-backup.yaml

# Đưa Kong Gateway về trạng thái trắng (Xóa sạch mọi thứ)
deck gateway reset --kong-addr http://160.191.32.224:8001 --force
#chạy trong container kong
deck gateway reset --kong-addr http://kong:8001 --force
```

### 🗄️ Xóa dữ liệu trong Database (Đi kèm)
Để đảm bảo đồng bộ hoàn toàn, hãy truncate các bảng liên quan trong Database:
```bash
docker exec -it postgres-portal psql -U postgres -d DMST_Integration_DB -c "
TRUNCATE kong_route_plugins, kong_consumer_keys, kong_consumers, kong_route_config_history, kong_route_configs CASCADE;
"
```
