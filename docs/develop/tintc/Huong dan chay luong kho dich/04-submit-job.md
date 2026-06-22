# 04 — Submit Flink Runtime Job Theo Kho

Sau khi upload JAR, mỗi kho cần một runtime job đang chạy. Job này đọc toàn bộ topic PL6 của kho bằng pattern và publish sang PL7.

## Submit Job TTDLQG

```bash
curl -X POST http://localhost:9080/api/flink/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "generic-stream-processor",
    "parameters": {
      "metadata.id": "ttdlqg-template",
      "kafka.source.topic.pattern": "TH_TTDLQG_.*",
      "kafka.starting.offset": "earliest",
      "kafka.partition.discovery.interval.ms": "30000",
      "kafka.file.request.topic.partitions": "3",
      "kafka.file.request.topic.replication.factor": "1"
    },
    "parallelism": 4,
    "jobName": "TTDLQG - PL6 to PL7"
  }'
```

Response:

```json
{
  "id": "<EXEC_ID>",
  "jobId": "generic-stream-processor",
  "flinkJobId": "<FLINK_JOB_ID>",
  "status": "SUBMITTED"
}
```

Lưu `id` để xem stats:

```bash
curl http://localhost:9080/api/flink/executions/<EXEC_ID>/stats
```

## Tham Số Chính

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `metadata.id` | Có | `name` hoặc `id` trong `data_source_metadata`, ví dụ `ttdlqg-template` |
| `kafka.source.topic.pattern` | Có nếu đọc nhiều topic | Pattern topic PL6 của kho, ví dụ `TH_TTDLQG_.*` |
| `kafka.source.topic` | Có nếu chỉ đọc list topic cụ thể | Danh sách topic cách nhau bằng dấu phẩy |
| `kafka.starting.offset` | Không | Nên dùng `earliest` cho job đọc pattern để không bỏ qua message có trước lúc Flink discover topic |
| `kafka.partition.discovery.interval.ms` | Không | Chu kỳ Flink scan topic mới khi dùng pattern, ví dụ `30000` |
| `kafka.cdp.metadata.topic` | Không | Nếu bỏ trống, PL7 dùng cùng tên topic PL6 |
| `kafka.file.request.topic.partitions` | Không | Số partition topic `FILE_DOWNLOAD_REQUEST_*`, default `3` |
| `kafka.file.request.topic.replication.factor` | Không | Replication factor topic `FILE_DOWNLOAD_REQUEST_*`, default `1` |
| `stats.interval` | Không | Chu kỳ ghi stats, default 30 giây |
| `parallelism` | Không | Parallelism Flink |

Admin Service tự merge các tham số môi trường vào Flink program args:

```text
db.host / db.port / db.name / db.user / db.password
kafka.brokers
kafka.cdp.brokers
```

Chỉ truyền các tham số trên trong body khi cần override env.

## Submit Kho Mới

Không upload lại JAR. Chỉ tạo template metadata và submit thêm runtime job với pattern của kho.

Ví dụ Kho Mở:

```json
{
  "jobId": "generic-stream-processor",
  "parameters": {
    "metadata.id": "kho-mo-template",
    "kafka.source.topic.pattern": "TH_KHO_MO_.*",
    "kafka.starting.offset": "earliest",
    "kafka.partition.discovery.interval.ms": "30000"
  },
  "parallelism": 4,
  "jobName": "KHO_MO - PL6 to PL7"
}
```

## Kiểm Tra Job Đang Chạy

```bash
curl http://localhost:9080/api/flink/executions/<EXEC_ID>
curl http://localhost:9080/api/flink/jobs/generic-stream-processor/executions
```

Flink Web UI:

```text
http://160.191.32.193:8181
```
