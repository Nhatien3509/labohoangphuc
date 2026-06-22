# 06 — Troubleshooting

## Bảng lỗi thường gặp

| Vấn đề | Nguyên nhân | Xử lý |
|--------|-------------|-------|
| Upload JAR lỗi "invalid jar" | Thiếu `Job-Id` trong MANIFEST | Rebuild: `mvn clean package` |
| Submit lỗi "job not found" | Chưa upload JAR | Bước 2 trước |
| Stats luôn là 0 | `execution.id` không khớp | Xem EXEC_ID từ response submit |
| Status mãi `SUBMITTED` | Flink URL sai hoặc network | Kiểm tra `FLINK_URL` trong `.env` + xem `docker network` |
| Flink RUNNING nhưng `Kafka Source` = 0 record | Job dùng topic pattern nhưng chưa bật partition discovery, hoặc submit `latest` sau khi topic đã có message | Rebuild JAR mới, submit lại với `kafka.partition.discovery.interval.ms=30000` và `kafka.starting.offset=earliest` |
| Result topic rỗng | Validation fail hết | Xem `recordsInvalid` trong stats, kiểm tra `sourceFields` |
| Kafka topic chưa tồn tại | Flink chưa tạo kịp | Đợi ~30s sau submit |
| Không thấy `FILE_DOWNLOAD_REQUEST_*` | JAR cũ chỉ `producer.send` nhưng không tự tạo topic request; hoặc đang xem nhầm Kafka cluster | Upload JAR mới, submit lại job; kiểm tra Kafka PL6/source broker |
| `fileDownloadEnabled` không có tác dụng | Flink đã load metadata lúc start | Stop job → sửa metadata → submit lại |
| `recordsFileRequested` = 0 | `fileListPath` sai hoặc field trống | Dùng JSONPath tester kiểm tra expression |
| File download không xử lý | `file-downloader-service` chưa chạy | Kiểm tra container `dmst-file-downloader` |
| Deploy lỗi "network not found" | External network chưa tồn tại trên server | Script deploy tự tạo, hoặc tạo tay: `docker network create <name>` |

---

## Debug nhanh

### Xem log Admin Service

```bash
docker logs thcs-admin-service --tail=100 -f
```

### Xem log Flink TaskManager

```bash
docker logs <flink-taskmanager-container> --tail=100 | grep GenericStreamProcessor
```

### Xem log file-downloader

```bash
docker logs dmst-file-downloader --tail=100 -f
```

### Kiểm tra network

```bash
docker network ls | grep -E 'thcs|dmst|integration'
docker inspect <container> --format='{{json .NetworkSettings.Networks}}'
```

### Kiểm tra Flink kết nối Admin Service

```bash
# Từ trong container admin-service
docker exec -it thcs-admin-service wget -qO- http://int-flink-jm-1:8081/v1/jobs
```

---

## Reset test

```bash
# Xóa data source
curl -X DELETE http://localhost:9080/api/v1/data-sources/<ID>

# Cancel Flink job
curl -X DELETE http://localhost:9080/api/flink/executions/<EXEC_ID>
```
