# Luồng Chạy — Repository Stream Processor

**Admin Service:** `http://localhost:9080`

## Nguyên tắc mới

- Mỗi **kho dữ liệu** có một template/schema metadata riêng, ví dụ `ttdlqg-template`, `kho-mo-template`.
- Mỗi **dataflow** trên giao diện admin sinh Kong route và Kafka topic PL6 riêng, ví dụ `TH_TTDLQG_DL001_0001`.
- Một Flink runtime job xử lý một kho bằng topic pattern, ví dụ `TH_TTDLQG_.*`.
- Flink đọc topic PL6, validate/transform theo template của kho, rồi publish sang Kafka PL7. Nếu không cấu hình sink topic riêng, topic PL7 giữ cùng tên topic PL6.

```text
[Admin Service]
  ├── Tạo Data Source Metadata theo kho/template
  ├── Tạo Dataflow trên giao diện
  │    ├── Sinh Kong route/gateway
  │    └── Sinh Kafka topic PL6: TH_<KHO>_<MA_LOAI_DU_LIEU>_<STT>
  └── Submit Flink runtime job theo kho

[Ingest Service]
  └── Gọi API kho qua Kong route được gán
       └── Publish data vào Kafka PL6 topic của dataflow

[Flink generic-stream-processor]
  └── metadata.id=<kho>-template
       ├── Subscribe Kafka PL6 theo pattern: TH_<KHO>_.*
       ├── Validate/transform theo template metadata của kho
       ├── Publish sang Kafka PL7 cùng topic nguồn
       └── [nếu fileDownloadEnabled=true] publish FILE_DOWNLOAD_REQUEST_*
```

Ví dụ TTDLQG:

```text
metadata.id=ttdlqg-template
kafka.source.topic.pattern=TH_TTDLQG_.*

PL6: TH_TTDLQG_DL001_0001 -> PL7: TH_TTDLQG_DL001_0001
PL6: TH_TTDLQG_DL002_0001 -> PL7: TH_TTDLQG_DL002_0001
```

## Hướng dẫn chi tiết

| Bước | File |
|------|------|
| 1. Chuẩn bị & chạy Admin Service | [01-chuan-bi.md](01-chuan-bi.md) |
| 2. Build & Upload Flink JAR | [02-flink-jar.md](02-flink-jar.md) |
| 3. Tạo Data Source Metadata theo kho/template | [03-data-source.md](03-data-source.md) |
| 4. Submit Flink runtime job theo kho | [04-submit-job.md](04-submit-job.md) |
| 5. Test & kiểm tra kết quả | [05-test-va-kiem-tra.md](05-test-va-kiem-tra.md) |
| 6. Troubleshooting | [06-troubleshooting.md](06-troubleshooting.md) |

## Quick Start TTDLQG

```bash
# 1. Build JAR
cd src/stream-processing/flink-jobs/jobs/generic-stream-processor
mvn clean package -DskipTests

# 2. Upload JAR qua Admin Service
curl -X POST http://localhost:9080/api/flink/jars/upload \
  -F "file=@target/generic-stream-processor-1.0.0.jar"

# 3. Tạo metadata template cho kho TTDLQG
curl -X POST http://localhost:9080/api/v1/data-sources \
  -H "Content-Type: application/json" \
  -d '{"name":"ttdlqg-template","sourceFields":[...],"sinkFields":[...],"fileDownloadEnabled":false}'

# 4. Submit một Flink runtime job cho toàn bộ topic TTDLQG
curl -X POST http://localhost:9080/api/flink/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "generic-stream-processor",
    "parameters": {
      "metadata.id": "ttdlqg-template",
      "kafka.source.topic.pattern": "TH_TTDLQG_.*"
    },
    "parallelism": 4,
    "jobName": "TTDLQG - PL6 to PL7"
  }'
```

## Thêm kho mới

Không rebuild JAR nếu logic xử lý vẫn giống nhau. Khi thêm kho mới:

1. Tạo metadata template mới, ví dụ `kho-mo-template`.
2. Dataflow admin sinh topic theo kho, ví dụ `TH_KHO_MO_DL001_0001`.
3. Submit thêm một runtime job từ cùng JAR:

```text
metadata.id=kho-mo-template
kafka.source.topic.pattern=TH_KHO_MO_.*
```
