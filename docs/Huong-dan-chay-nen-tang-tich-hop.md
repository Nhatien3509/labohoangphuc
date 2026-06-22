# Hướng dẫn chạy dự án nền tảng tích hợp

---

## Môi trường 1 — Chạy local (Go trực tiếp)

### Yêu cầu

- Go 1.22+
- Các service hạ tầng đã chạy sẵn trên `160.191.32.193`:
  - PostgreSQL `:5432`
  - Kafka external ports `:9092, :9093, :9094`
  - SigNoz UI `:3301` / OTLP gRPC `:4317`
  - Kong Admin `:8001`
  - Vault `:8200`
  - Kafka UI `:8190`

### Chạy 3 service local

Mở **3 terminal riêng**, chạy theo thứ tự:

**Terminal 1 — Mock datasource (port 8090)**

```bash
cd srcs/dmst-mock-datasource
make run
```

> Sinh sẵn 5000 projects, 5000 experts, 5000 submissions trong bộ nhớ.
> Endpoint: `http://localhost:8090/api/v1/projects|experts|submissions`

**Terminal 2 — Ingest service (port 8081)**

```bash
cd srcs/dmst-ingest-svc
go run cmd/ingest/main.go
```

> Kết nối PostgreSQL + Kafka + SigNoz trên `160.191.32.193` theo `.env`.
> Endpoint: `http://localhost:8081`

**Terminal 3 — Admin service (port 8080)**

```bash
cd srcs/dmst-admin-api
go run cmd/api/main.go
```

> Kết nối PostgreSQL + Kafka + Kong + Vault trên `160.191.32.193` theo `.env`.
> Endpoint: `http://localhost:8080`

### Kiểm tra health

```bash
curl http://localhost:8090/health   # mock-datasource
curl http://localhost:8081/health   # ingest
curl http://localhost:8080/health   # admin
```

---

## Môi trường 2 — Deploy lên Docker (server 160.191.32.193)

### Yêu cầu

- Docker đang chạy trên máy local
- SSH key tại `dmst/secret-key/dmst.pem`
- Hạ tầng đã sẵn sàng trên server: Kafka, PostgreSQL, Kong, Vault, SigNoz

### Cấu trúc deploy

```
deploy/
├── scripts/ci/deploy.sh          ← entry point
├── envs/demo/
│   ├── config/  .env             ← config cho dmst-admin-api
│   ├── ingest/  .env             ← config cho dmst-ingest-svc
│   └── mockds/  .env             ← config cho dmst-mock-datasource
├── docker/
│   ├── config/  Dockerfile       ← build dmst-admin-api
│   ├── ingest/  Dockerfile       ← build dmst-ingest-svc
│   └── mockds/  Dockerfile       ← build dmst-mock-datasource
└── templates/
    ├── docker-compose.yml        ← admin stack (config-api, mock-dest, ...)
    └── ingest-stack.yml          ← ingest stack (mock-datasource, ingest)
```

### Port trên server sau khi deploy

| Service | Host port | Container port |
|---------|-----------|---------------|
| dmst-admin-api (config-api) | `9080` | `9080` |
| dmst-mock-datasource | `8090` | `8090` |
| dmst-ingest-svc | `9181` | `8081` |

### Lệnh deploy

```bash
cd deploy/scripts/ci
```

**Deploy từng service:**

```bash
./deploy.sh config demo          # admin API
./deploy.sh mockds demo          # mock datasource
./deploy.sh ingest demo          # ingest service
```

**Deploy nhiều service cùng lúc (tuần tự):**

```bash
# Ingest stack: mockds trước, ingest sau (đúng thứ tự dependency)
./deploy.sh mockds,ingest demo

# Tất cả
./deploy.sh config,mockds,ingest demo
```

**Deploy với version tag cụ thể:**

```bash
./deploy.sh ingest demo v0.0.2-tintc
./deploy.sh mockds,ingest demo v0.0.3-tintc
```

**Các flag hữu ích:**

```bash
--force-compose    # Overwrite compose file trên server (dùng khi sửa template)
--build-only       # Chỉ build image local, không deploy lên server
--cleanup          # Xóa image cũ sau khi deploy
```

**Ví dụ thực tế:**

```bash
# Lần đầu deploy ingest stack (cần sync compose file)
./deploy.sh mockds,ingest demo --force-compose

# Sau khi sửa code ingest, bump version và deploy
./deploy.sh ingest demo v0.0.2-tintc

# Sửa compose template (port, env, network) → force sync lên server
./deploy.sh ingest demo --force-compose
```

### Lưu ý khi dùng cùng tag cũ

Nếu image `dmst-ingest:v0.0.1-tintc` đã tồn tại local, script **không rebuild**. Cần xóa image + tar trước:

```bash
docker rmi dmst-ingest:v0.0.1-tintc
rm ~/Desktop/docker/images_backup/dmst-ingest_v0.0.1-tintc.tar
./deploy.sh ingest demo v0.0.1-tintc
```

Hoặc đơn giản hơn: **bump version mới** (`v0.0.2-tintc`, `v0.0.3-tintc`, ...).

### Kiểm tra health sau deploy

```bash
curl http://160.191.32.193:8090/health   # mock-datasource
curl http://160.191.32.193:9181/health   # ingest
curl http://160.191.32.193:9080/health   # admin
```

---

## Verify trên Kafka UI

Truy cập [http://160.191.32.193:8190](http://160.191.32.193:8190) → Topics → chọn topic → Messages.

## Xem logs/traces trên SigNoz

Truy cập [http://160.191.32.193:3301](http://160.191.32.193:3301) → Logs → filter `service.name = dmst-integration-ingest`.
