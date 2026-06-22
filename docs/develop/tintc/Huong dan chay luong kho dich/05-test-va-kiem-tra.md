# 05 — Kiểm Tra Kết Quả

Flink job đọc topic PL6 theo pattern của kho và publish sang Kafka PL7. Nếu không cấu hình `kafka.cdp.metadata.topic`, tên topic PL7 giữ nguyên tên topic nguồn PL6.

## 1. Xác nhận topic PL6 có data

Ví dụ với dataflow TTDLQG mã loại dữ liệu `DL001`:

```bash
curl "http://localhost:9080/api/v1/kafka/topics/TH_TTDLQG_DL001_0001/messages?limit=5"
```

Nếu topic rỗng, kiểm tra dataflow/ingest service đã gọi API kho qua Kong route chưa.

## 2. Xem Stats Flink

Đợi tối đa 30 giây sau khi job start:

```bash
curl http://localhost:9080/api/flink/executions/<EXEC_ID>/stats
```

Response mẫu:

```json
{
  "recordsIn": 120,
  "recordsValid": 118,
  "recordsInvalid": 2,
  "recordsKafkaPublished": 118,
  "recordsFileRequested": 0,
  "validationPassRate": "98.3%",
  "checkpointCount": 3
}
```

| Field | Ý nghĩa |
|-------|---------|
| `recordsIn` | Tổng message Flink nhận từ Kafka PL6 |
| `recordsValid` / `recordsInvalid` | Qua hoặc bị drop bởi schema validation |
| `recordsKafkaPublished` | Đã publish sang Kafka PL7 |
| `recordsFileRequested` | Số request tải file đã publish |
| `validationPassRate` | Tỷ lệ valid |

## 3. Verify Topic PL7

Nếu sink topic không cấu hình riêng, topic PL7 trùng tên PL6:

```text
PL6: TH_TTDLQG_DL001_0001
PL7: TH_TTDLQG_DL001_0001
```

Kiểm tra bằng công cụ Kafka/SMM của PL7 hoặc API monitor tương ứng:

```bash
# Ví dụ nếu Admin Service đang trỏ Kafka monitor tới cluster PL7
curl "http://localhost:9080/api/v1/kafka/topics/TH_TTDLQG_DL001_0001/messages?limit=10"
```

Message output phải theo `sinkFields` của `metadata.id=ttdlqg-template`.

## 4. Verify File Download Nếu Có

Nếu `fileDownloadEnabled=true`, kiểm tra topic request:

```bash
curl "http://localhost:9080/api/v1/kafka/topics/FILE_DOWNLOAD_REQUEST_<MA_LOAI_DU_LIEU>/messages?limit=10"
```

Ví dụ:

```bash
curl "http://localhost:9080/api/v1/kafka/topics/FILE_DOWNLOAD_REQUEST_DL001/messages?limit=10"
```

Sau khi `file-downloader-service` xử lý xong, kiểm tra topic result theo cấu hình service.

## 5. Verify Status Runtime Job

```bash
curl http://localhost:9080/api/flink/executions/<EXEC_ID>
```

Danh sách execution của cùng JAR:

```bash
curl http://localhost:9080/api/flink/jobs/generic-stream-processor/executions
```
