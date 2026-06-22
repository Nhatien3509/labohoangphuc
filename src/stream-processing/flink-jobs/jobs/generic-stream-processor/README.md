# Generic Stream Processor — Flink Job

A reusable Apache Flink job that processes data from multiple sources by loading schema definitions and transformation rules from PostgreSQL database.

## Features

- **Dynamic Metadata**: Load source/sink field definitions from database at runtime
- **Schema Validation**: Validate incoming JSON messages against configured source schema
- **Data Transformation**: Transform and map source fields to sink fields with optional rules
- **Multi-Source**: Single job handles multiple data sources with different schemas
- **Kafka Integration**: Consume from Kafka topics and produce transformed data to result topic
- **HDFS Output**: Write transformed data to HDFS with date-based partitioning

## Build

```bash
mvn clean package -DskipTests
```

Output: `target/generic-stream-processor-1.0.0.jar` (80MB fat JAR with all dependencies)

## Prerequisites

1. **PostgreSQL Database** with `data_source_metadata` table containing:
   - `id` (UUID)
   - `name` (VARCHAR)
   - `sourceFields` (JSONB) — list of {name, type, required}
   - `sinkFields` (JSONB) — list of {sourceName, sinkName, transform}
   - `kafkaTopicPattern` (VARCHAR) — Kafka topic to subscribe to
   - `sinkHdfsPath` (VARCHAR) — HDFS output directory
   - `validations` (JSONB) — optional validation rules

2. **Kafka Cluster** with topics corresponding to configured `kafkaTopicPattern`

3. **HDFS** for writing output files

4. **Apache Flink 1.19+** cluster with:
   - `flink-connector-kafka` available
   - `flink-connector-files` (hdfs:// support)

## Job Submission

### Via Flink REST API

```bash
# Upload JAR
curl -X POST -F "jarfile=@target/generic-stream-processor-1.0.0.jar" \
  http://localhost:8081/jars/upload

# Submit job
curl -X POST http://localhost:8081/v1/jars/{jar-id}/run \
  -d '{
    "entryClass": "com.gtsc.dmst.flink.GenericStreamProcessor",
    "programArgs": "--metadata.id soy-te --kafka.brokers kafka:9092 --db.host postgres --db.port 5432 --db.name adm_db --db.user postgres --db.password secret --parallelism 4"
  }'
```

### Via Admin Service (Recommended)

Register the JAR through the admin service API:

```bash
# 1. Upload JAR through admin service
curl -F "file=@target/generic-stream-processor-1.0.0.jar" \
  http://localhost:8080/api/flink/jars/upload

# 2. Submit job with parameters
curl -X POST http://localhost:8080/api/v1/data-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "soy-te",
    "description": "Sở Y Tế data source",
    "sourceFields": [
      {"name": "ngay", "type": "date", "required": true},
      {"name": "benh_nhan", "type": "string", "required": true},
      {"name": "benh_tat", "type": "string", "required": false}
    ],
    "sinkFields": [
      {"sourceName": "ngay", "sinkName": "date"},
      {"sourceName": "benh_nhan", "sinkName": "patient_name", "transform": "upper"},
      {"sourceName": "benh_tat", "sinkName": "disease"}
    ],
    "kafkaTopicPattern": "SOY_TE_DATA",
    "sinkHdfsPath": "/dmst/data/soy-te"
  }'

# 3. Submit job
curl -X POST http://localhost:8080/api/flink/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "generic-stream-processor",
    "parameters": {
      "metadata.id": "soy-te",
      "kafka.brokers": "kafka:9092",
      "db.host": "postgres",
      "db.port": "5432",
      "db.name": "adm_db",
      "db.user": "postgres",
      "db.password": "secret"
    },
    "parallelism": 4
  }'
```

## Job Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `metadata.id` | (required) | Data source metadata ID from database |
| `kafka.brokers` | localhost:9092 | Kafka broker addresses |
| `db.host` | localhost | PostgreSQL host |
| `db.port` | 5432 | PostgreSQL port |
| `db.name` | adm_db | PostgreSQL database |
| `db.user` | postgres | PostgreSQL user |
| `db.password` | secret | PostgreSQL password |
| `parallelism` | 4 | Flink parallelism level |
| `checkpoint.interval` | 60000 | Checkpoint interval (ms) |
| `state.backend` | rocksdb | State backend: rocksdb or memory |

## Example Data Flows

### Example 1: Sở Y Tế (Health Department)

**Metadata Configuration:**
```json
{
  "id": "soy-te",
  "name": "Sở Y Tế",
  "sourceFields": [
    {"name": "ngay", "type": "date", "required": true},
    {"name": "ma_don_vi", "type": "string", "required": true},
    {"name": "so_benh_nhan", "type": "int", "required": true},
    {"name": "benh_tat", "type": "string", "required": false}
  ],
  "sinkFields": [
    {"sourceName": "ngay", "sinkName": "report_date"},
    {"sourceName": "ma_don_vi", "sinkName": "facility_code"},
    {"sourceName": "so_benh_nhan", "sinkName": "patient_count"},
    {"sourceName": "benh_tat", "sinkName": "disease_name", "transform": "upper"}
  ],
  "validations": [
    {"fieldName": "so_benh_nhan", "ruleType": "range", "ruleValue": "0-1000000"}
  ],
  "kafkaTopicPattern": "HEALTH_REPORT",
  "sinkHdfsPath": "/dmst/data/health/reports"
}
```

**Input Message:**
```json
{
  "ngay": "2026-05-09",
  "ma_don_vi": "HD001",
  "so_benh_nhan": 150,
  "benh_tat": "covid-19"
}
```

**Output Message:**
```json
{
  "report_date": "2026-05-09",
  "facility_code": "HD001",
  "patient_count": 150,
  "disease_name": "COVID-19"
}
```

### Example 2: Sở GD&ĐT (Education Department)

**Metadata Configuration:**
```json
{
  "id": "sogddt",
  "name": "Sở GD&ĐT",
  "sourceFields": [
    {"name": "nam_hoc", "type": "string", "required": true},
    {"name": "truong", "type": "string", "required": true},
    {"name": "lop", "type": "int", "required": true},
    {"name": "so_hoc_sinh", "type": "int", "required": true}
  ],
  "sinkFields": [
    {"sourceName": "nam_hoc", "sinkName": "school_year"},
    {"sourceName": "truong", "sinkName": "school_name", "transform": "trim"},
    {"sourceName": "lop", "sinkName": "grade"},
    {"sourceName": "so_hoc_sinh", "sinkName": "student_count"}
  ],
  "kafkaTopicPattern": "EDUCATION_DATA",
  "sinkHdfsPath": "/dmst/data/education"
}
```

## Output

- **Kafka Result Topic**: `{metadata.id}-result` (e.g., `soy-te-result`)
- **HDFS Path**: Configured in metadata `sinkHdfsPath`
- **HDFS Partitioning**: By processing date (YYYY/MM/DD)

## Monitoring

### Flink Web UI
- Job status: `http://localhost:8081`
- Task managers, slots, backpressure monitoring

### Logs
```bash
# Check Flink TaskManager logs for this job
docker logs <flink-taskmanager-container> | grep GenericStreamProcessor
```

### Metrics
- Records in/out per second
- Processing latency
- Watermark progression
- Backpressure indicators

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Data source metadata not found" | Metadata ID doesn't exist in DB | Register metadata via admin API |
| Validation failures | Schema mismatch | Check sourceFields definition |
| Kafka consumer lag | Processing too slow | Increase parallelism |
| HDFS connection failed | Network/config issue | Verify HDFS address and Kerberos setup |

## Development

### Adding Custom Transformations

Edit `DataTransformer.java` `applyTransform()` method to add new transform types:

```java
case "custom_rule":
    // implement custom logic
    return mapper.valueToTree(result);
```

### Adding Custom Validators

Edit `SchemaValidator.java` `applyValidationRule()` method:

```java
case "custom_validation":
    // implement validation logic
    return isValid;
```

## License

Internal DMST project
