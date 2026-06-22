# 02 — Build & Upload Flink JAR

JAR `generic-stream-processor` là code dùng chung. Chỉ cần upload lại khi code Java thay đổi. Khi thêm kho mới hoặc thêm mã loại dữ liệu mới, không cần rebuild JAR nếu template/schema vẫn xử lý được bằng metadata.

## Build JAR

Chạy trên máy local, cần Maven 3.8+ và Java 17:

```bash
cd src/stream-processing/flink-jobs/jobs/generic-stream-processor
mvn package -P dev -DskipTests -Dtimestamp=$(date +%Y%m%d-%H%M%S)
mvn package -P test -DskipTests -Dtimestamp=$(date +%Y%m%d-%H%M%S)
mvn package -P prod -DskipTests -Dtimestamp=$(date +%Y%m%d-%H%M%S)
```

Output:

```text
target/generic-stream-processor-1.0.0.jar
```

## Upload JAR lên Admin Service

```bash
curl -X POST http://localhost:9080/api/flink/jars/upload \
  -F "file=@src/stream-processing/flink-jobs/jobs/generic-stream-processor/target/generic-stream-processor-1.0.0.jar"
```

Response mong đợi:

```json
{
  "message": "job registered successfully",
  "jobId": "generic-stream-processor",
  "entryClass": "com.gtsc.dmst.flink.GenericStreamProcessor",
  "jarFile": "generic-stream-processor-1.0.0.jar",
  "flinkJarId": "<flink-uploaded-jar-id>"
}
```

Admin Service tự đọc `MANIFEST.MF` và đăng ký vào bảng `flink_jobs`.

## Verify

```bash
curl http://localhost:9080/api/flink/jobs/generic-stream-processor
```

## Cách dùng JAR sau khi upload

Cùng một JAR có thể chạy nhiều runtime job theo kho:

```text
TTDLQG: metadata.id=ttdlqg-template, kafka.source.topic.pattern=TH_TTDLQG_.*
KHO_MO: metadata.id=kho-mo-template, kafka.source.topic.pattern=TH_KHO_MO_.*
```

Không upload lại JAR khi chỉ thêm dataflow/topic mới như `TH_TTDLQG_DL002_0001`.
