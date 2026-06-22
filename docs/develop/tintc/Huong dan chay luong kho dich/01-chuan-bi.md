# 01 — Chuẩn bị & Chạy Admin Service

## Hạ tầng cần có

| Thành phần | Địa chỉ |
|------------|---------|
| PostgreSQL | `160.191.32.193:5432` — DB: `DMST_Integration_DB` |
| Kafka | `160.191.32.193:9092,9093,9094` |
| Flink cluster | `160.191.32.193:8181` |
| Kafka UI | `http://160.191.32.193:8190` |
| Flink Web UI | `http://160.191.32.193:8181` |

---

## Chạy Admin Service

### Option A — Local dev

```bash
cd src/services/admin-service
go run ./cmd/server
```

### Option B — Docker trên server .193

```bash
./deploy.sh admin-service demo
```

Hoặc thủ công:
```bash
ssh h04@160.191.32.193
cd /home/h04/poc/tich-hop-chia-se/config
docker compose up -d thcs-admin-service
docker logs thcs-admin-service -f --tail=50
```

### Verify

```bash
curl http://localhost:9080/health
# → {"status":"ok"}
```

### Admin Service tự làm khi khởi động

- AutoMigrate tất cả tables (`data_source_metadata`, `flink_jobs`, `flink_job_executions`, `flink_stream_stats`)
- Tự thêm cột mới nếu model có thay đổi (không cần chạy migration tay)
- Start `FlinkStatusPoller` goroutine — poll Flink REST API mỗi 30s
