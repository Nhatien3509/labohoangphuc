# Luồng thay đổi — Adopt Cloudera Data Platform (CDP + CFM)

> Nguồn tham chiếu: Confluence — "Tài liệu nghiên cứu Cloudera Data Platform" (page 42239352)
> Quyết định: chốt **KS-Y (Hybrid tối ưu)** — giữ PL6 100%, NiFi làm cổng vào Kho, file binary qua Knox → Ozone

---

## 1. Tổng quan thay đổi

### Trước (pipeline hiện tại)

```
Kafka PL6 → Flink (validate + transform + Iceberg sink) → HDFS Iceberg (standalone)
                  └── file download trigger → file-downloader → HDFS
```

- Flink ghi Iceberg trực tiếp xuống HDFS standalone (DMST-DEV)
- file-downloader ghi file vào HDFS
- Không có catalog HMS
- Không có query engine
- Không có NiFi
- Không có Ozone

### Sau (KS-Y theo Cloudera)

```
PL6 (giữ 100% — không sửa logic):
  integration-svc → Kong → Kho DL Mở (4 API)
  → Redis pre-filter → Kafka PL6
  → Flink PL6 (RocksDB dedup)
      ├── metadata        → Kafka CDP (PL7)
      └── FILE_DOWNLOAD_REQUEST → Kafka PL6
            → file-downloader → Knox PL7 → Ozone S3
            → FILE_DOWNLOADED_RESULT → Kafka PL6

PL7 (CDP + CFM):
  NiFi (CFM):
    ConsumeKafka(metadata)    → DetectDuplicate → ValidateRecord → PutIceberg (HDFS Bronze)
    ConsumeKafka(file result từ Kafka PL6) → ValidateRecord → PutIceberg (_FILES table)
    [ETL nội bộ] Bronze → Silver scheduled
  HDFS Iceberg (Cloudera) — metadata
  Ozone (Cloudera)         — file binary
  HMS                       — catalog Iceberg
  Impala                    — query interactive
  Spark                     — ETL + maintenance cron
  Ranger + Atlas + Knox     — security + governance + gateway
```

---

## 2. Stack chốt

| Layer | Component | Vai trò |
|-------|-----------|---------|
| Ingest streaming | Flink PL6 (standalone, KHÔNG trong CDP BOM) | Dedup, route metadata sang Kafka CDP, route file request sang Kafka PL6 |
| Ingest cổng vào Kho | **NiFi (CFM)** | Cổng vào duy nhất cho metadata → Iceberg |
| Storage structured | HDFS + **Iceberg** | Table format ACID cho metadata |
| Storage file binary | **Ozone** (S3 API) | Object store, bucket per zone |
| Catalog | **HMS (Hive Metastore)** | Catalog tập trung — Iceberg tables |
| Query interactive | **Impala** | Sub-second SQL cho share-service + Hue + Tableau |
| ETL + Maintenance | **Spark** + NiFi scheduled | Compaction Iceberg, Bronze→Silver, expire snapshots |
| Security gateway | **Knox** | TLS + auth proxy, single endpoint |
| ACL | **Ranger** | Policy resource-based / tag-based / row-level filter / column masking |
| Governance | **Atlas** | Catalog, lineage, classification |
| Auth | **Kerberos** (Security Level 1+) | SSO nội bộ cluster |
| Cluster management | **Cloudera Manager** | Deploy, monitor, parcels |
| Streaming PL6 | Flink + Kafka PL6 + Redis (giữ nguyên) | Dedup + pre-filter PL6 |
| File ingest PL6 | file-downloader Go (giữ — đổi target) | Stream file qua Knox → Ozone |

---

## 3. Phân chia trách nhiệm PL6 vs PL7

### PL6 (Hệ thống Tích hợp Chia sẻ DL)
- Server hiện tại: `160.191.32.224`
- Kong (API gateway outbound)
- integration-svc (Go)
- Kafka PL6 (Apache standalone, không Cloudera)
- Flink PL6 (Apache, RocksDB dedup state)
- file-downloader-svc (Go, 4 VM worker pool, retry 3, checksum SHA256)
- Redis pre-filter (phienBan check)

### PL7 (Kho DL TTST — Cloudera)
- Server hiện tại: `160.191.32.149`
- CDP trial single-node: HDFS, Iceberg, HMS, Impala, Spark, Kafka CDP, Ranger, Atlas, Knox, Ozone, ZooKeeper, Hue
- Kafka CDP bootstrap candidate: `160.191.32.149:9092` — cần verify listener/security trong Cloudera Manager trước khi cấu hình Flink/NiFi
- CFM: NiFi + NiFi Registry + Schema Registry
- admin-service Go (control plane, gọi CM/NiFi/Knox/Atlas/Ranger API)
- share-service Go (REST API cho consumer, gọi Impala JDBC qua Knox)
- Frontend Next.js (Web Admin Kho)
- Tableau (BI)

---

## 4. Luồng dữ liệu chi tiết KS-Y

### 4.1 Luồng metadata

```
PL6:
  integration-svc → Kafka PL6 topic INGEST_OPENDATA_RAW
  Flink PL6 consume → dedup RocksDB (per dataset+phienBan)
                    → produce metadata sang Kafka CDP topic TTDLQG_KHOMO_<MA_LOAI_DL>
PL7:
  NiFi ConsumeKafka(TTDLQG_KHOMO_.*)
       → DetectDuplicate (key: dataset_id + phienBan) — safety net
       → ValidateRecord (schema Avro/JSON)
       → QueryRecord (cross-field SQL validation)
       → LookupRecord (reference data check)
       → UpdateAttribute (enrich: zone, ingest_ts)
       → PutIceberg → HDFS Iceberg table zone2.{MA_CAP_CHA}_{MA_HT_NGUON}_{MA_LOAI_DL}
```

### 4.2 Luồng file binary

```
PL6:
  Flink PL6 produce FILE_DOWNLOAD_REQUEST → Kafka PL6
  file-downloader consume:
    1. POST get-link (Kong PL6 → Kho DL Mở) → token 1 lần
    2. GET download (Kong PL6 → Kho DL Mở) → stream file
    3. PUT file qua Knox PL7 → Ozone S3 bucket zone2/{MA_CAP_CHA}/{MA_HT_NGUON}/{MA_LOAI_DL}/file/{dataset_id}/{tenTep}
    4. Verify checksum SHA256
    5. Produce FILE_DOWNLOADED_RESULT → Kafka PL6
       (payload: dataset_id, file_id, phienBan, ozone_bucket, ozone_key, checksum, size, status)

PL7:
  NiFi ConsumeKafka(FILE_DOWNLOADED_RESULT từ Kafka PL6)
       → ValidateRecord
       → PutIceberg → HDFS Iceberg table zone2.{MA_CAP_CHA}_{MA_HT_NGUON}_{MA_LOAI_DL}_FILES
```

### 4.3 Luồng ETL Bronze → Silver (NiFi scheduled)

```
NiFi cron mỗi giờ:
  QueryIceberg (Bronze table)
    → SelectFields (parse nested JSON)
    → ValidateRecord (typed schema)
    → MergeRecord (dedup theo maDinhDanh)
    → PutIceberg (Silver table)
```

### 4.4 Luồng query consumer

```
Consumer → share-service Go
        → Knox (TLS + auth) → Impala JDBC :21050
        → Impala query Iceberg table via HMS catalog
        → result rows → share-service → JSON → Consumer
```

---

## 5. Cấu trúc lưu trữ HDFS + Ozone

```
HDFS (structured — Iceberg tables):
  /data/
    ├── zone2/{MA_CAP_CHA}/{MA_HT_NGUON}/{MA_LOAI_DL}/        — DL gốc bản sao (mã hóa, ẩn danh)
    │     ├── data/                                            — Parquet data files
    │     └── metadata/                                        — Iceberg metadata + snapshots
    ├── zone2/{MA_CAP_CHA}/{MA_HT_NGUON}/{MA_LOAI_DL}_FILES/   — Iceberg table reference file Ozone
    ├── zone3/...                                              — DL giả lập (masking phục vụ ĐMST)
    └── zone4/...                                              — DL sản phẩm/dịch vụ

Ozone (unstructured — file binary):
  Volume: ttst
  ├── Bucket: zone2/{MA_CAP_CHA}/{MA_HT_NGUON}/{MA_LOAI_DL}/file/{dataset_id}/{tenTep}
  ├── Bucket: zone3
  └── Bucket: zone4
```

**Không có folder `bronze/silver/gold` — Iceberg snapshot quản lý lifecycle**. File trên Ozone không di chuyển khi Bronze → Silver.

---

## 6. Thay đổi code chi tiết

### 6.1 Flink job (`generic-stream-processor`)

| Module hiện tại | Thay đổi |
|-----------------|----------|
| `IcebergSinkBuilder.java` | **BỎ** — không ghi Iceberg trực tiếp |
| `JsonToRowDataConverter.java` | **BỎ** |
| `GenericStreamProcessor.java` | Bỏ Iceberg sink, thay bằng **KafkaSink** produce metadata sang Kafka CDP |
| `FileDownloadFunction.java` | Giữ — produce sang Kafka PL6 topic FILE_DOWNLOAD_REQUEST (không đổi) |
| `pom.xml` | Bỏ `iceberg-flink-runtime`, `iceberg-hive-metastore`, `parquet-*` deps |

**New params**:
- `kafka.cdp.brokers` — Kafka CDP brokers (PL7)
- `kafka.cdp.metadata.topic.prefix` — prefix topic metadata đích: `TTDLQG_KHOMO_.*`
- `kafka.cdp.metadata.topic.field` — field trong message dùng làm suffix topic: `maLoaiDuLieu`
- `kafka.cdp.metadata.topic` — topic metadata đích sau khi resolve theo loại dữ liệu: `TTDLQG_KHOMO_<MA_LOAI_DL>`
- `kafka.pl6.file.topic` — topic file request PL6 (vd `FILE_DOWNLOAD_REQUEST`)

### 6.2 file-downloader-svc (Go)

| Hiện tại | Thay đổi |
|----------|----------|
| Ghi HDFS trực tiếp | Stream file qua **Knox HTTPS → Ozone S3 API** |
| Endpoint output | `https://knox-host:8443/gateway/cdp-proxy-api/s3/zone2/{key}` |
| Auth | Basic auth (user `file-downloader-svc` qua Knox LDAP/PAM) |
| Producer result | **Thêm**: produce `FILE_DOWNLOADED_RESULT` sang Kafka PL6 |

**Code change ~10 dòng**: đổi endpoint URL + thêm auth header + thêm Kafka PL6 producer result nếu service hiện chưa publish trạng thái.

### 6.3 admin-service Go (mở rộng — control plane)

| Module mới | Mục đích | API gọi |
|-----------|----------|---------|
| `internal/cm/` | Cloudera Manager API client | CM REST API v54 — service mgmt, metrics, audit |
| `internal/nifi/` | NiFi REST API client | Processor config, start/stop, provenance, parameter context |
| `internal/knox/` | Knox gateway client | TLS + JWT token, proxy to Impala/Ozone |
| `internal/impala/` | Impala JDBC via Knox | DDL Iceberg (CREATE TABLE), query catalog |
| `internal/ozone/` | Ozone S3 API client | CreateBucket, set quota, encryption |
| `internal/ranger/` | Ranger REST API client | Masking policy, ACL policy |
| `internal/atlas/` | Atlas REST API client | Catalog, lineage, classification, business metadata |
| `internal/kafka_admin/` | Kafka Admin Go (sarama) | CreateTopic, AlterConfig |

**Schema admin-db PG** (thêm):
- `catalog_entries` — danh mục 171 loại DL
- `metadata_schemas` — cấu trúc metadata per loại
- `validation_rules` — rule kiểm tra DL
- `masking_configs` — config giả lập DL (Ranger masking)
- `pipeline_configs` — trạng thái NiFi flow per loại
- `pipeline_metrics` — cache metrics NiFi/CM
- `flow_templates` — NiFi template library
- `users`, `roles`, `permissions`, `user_roles` — RBAC nội bộ
- `audit_logs` — aggregate từ CM/NiFi/Ranger audit

### 6.4 share-service Go (mới — REST API consumer)

| Endpoint | Mục đích |
|----------|----------|
| `POST /share/query` | Build SQL từ UI config, gọi Impala qua Knox JDBC |
| `GET /share/datasources` | List datasource available cho consumer (per API key scope) |
| `GET /share/datasources/{id}/schema` | Trả schema từ HMS qua Impala `DESCRIBE` |
| `POST /share/export` | Async export Parquet/CSV qua Spark/Impala, signed URL Ozone |
| `GET /share/exports/{token}` | Download signed file |

**Auth**: API key + HMAC. Backend gọi Knox `cdp-proxy-api/impala` qua JWT.

### 6.5 NiFi flow (mới — deploy lên CFM)

| Process group | Processors | Mục đích |
|---------------|-----------|----------|
| `ingest-metadata` | ConsumeKafka → DetectDuplicate → ValidateRecord → QueryRecord → LookupRecord → UpdateAttribute → PutIceberg | Cổng vào metadata, ghi Bronze HDFS |
| `ingest-file-result` | ConsumeKafka → ValidateRecord → PutIceberg | Cổng vào file metadata (sau khi file-downloader stream xong Ozone) |
| `etl-bronze-silver` | QueryIceberg → SelectFields → ValidateRecord → MergeRecord → PutIceberg | Scheduled ETL Bronze→Silver |
| `quality-rules` | ExecuteScript / QueryRecord | Custom validation rules từ admin-service |

---

## 7. Security plan

| Phase | Security level | Components |
|-------|----------------|------------|
| Phase 1 (POC) | **L0** | Cloudera trial, simple auth, không TLS |
| Phase 2 | **L1** | + Kerberos + Ranger + Audit |
| Phase 3 | **L2** | + TLS in-transit + Atlas governance |
| Phase 4 (Production) | **L3** | + Encryption at-rest + Ranger KMS + Compliance |

Khi enable L1+:
- Flink/NiFi/Go services cần **keytab** + JAAS config
- gohive driver cần GSSAPI auth
- Knox JWT token thay Basic auth
- TLS truststore cho Kafka SSL, HMS Thrift, Impala JDBC

---

## 8. Cross-network firewall

| # | Đường | Source | Target | Port | Protocol |
|---|-------|--------|--------|------|----------|
| 1 | Metadata produce | Flink PL6 (`160.191.32.224`) | Kafka CDP PL7 (`160.191.32.149:9092`, cần verify listener/security) | 9092-9094 | SASL_SSL (L1+) hoặc PLAINTEXT (L0) |
| 2 | File stream | file-downloader PL6 | Knox PL7 (`160.191.32.149:8443`) | 8443 | HTTPS |
| 3 | File result publish | file-downloader PL6 | Kafka PL6 | Internal PL6 | PLAINTEXT/SASL theo PL6 |
| 4 | File result consume | NiFi PL7 (`160.191.32.149`) | Kafka PL6 (`160.191.32.224`) | 9092-9094 | SASL_SSL (L1+) hoặc PLAINTEXT (L0) |
| 5 | admin-service control | admin-service PL6/app server (`160.191.32.224`) | CM/NiFi/Knox/Ranger/Atlas (`160.191.32.149`) | Internal Cloudera/API ports | TLS (L2+) |
| 6 | share-service query | share-service PL7 | Impala JDBC qua Knox | 8443 | HTTPS JDBC |

**Không có outbound từ PL7 ra Internet** (PL6 lo download Kho DL Mở).

---

## 9. Bỏ đi (so với hiện tại)

- ❌ Flink Iceberg sink (HadoopTables / HiveCatalog) — chuyển sang produce Kafka CDP
- ❌ HDFS standalone trên DMST-DEV — dùng HDFS Cloudera
- ❌ HMS standalone — dùng HMS Cloudera
- ❌ Trino tạm — dùng Impala Cloudera
- ❌ Spark standalone — dùng Spark on YARN Cloudera
- ❌ Datasource cũ (zone 2 trên DMST-DEV HDFS) — tạo lại trên Cloudera HDFS

## 10. Giữ nguyên

- ✓ Kafka PL6 (Apache standalone)
- ✓ Flink PL6 logic dedup + transform (chỉ đổi sink target)
- ✓ file-downloader Go logic (chỉ đổi endpoint output)
- ✓ integration-svc Go
- ✓ Redis pre-filter
- ✓ admin-service Go (mở rộng thêm modules, không thay đổi logic hiện có)
- ✓ Schema datasource_metadata, sourceFields, sinkFields (vẫn validate trong Flink + NiFi)
- ✓ Convention path `/data/zone<N>/...`

---

## 11. Roadmap thực thi

| Phase | Task | Effort | Component |
|-------|------|--------|-----------|
| 1 | Cài Cloudera trial — verify HDFS, HMS, Impala, Spark, Ozone, Kafka CDP, Knox | 2d | Ops |
| 2 | Deploy NiFi (CFM) — Docker hoặc Cloudera Manager add service | 1d | Ops |
| 3 | Sửa Flink: bỏ Iceberg sink, thêm Kafka CDP producer metadata | 1d | Dev |
| 4 | Sửa file-downloader: target Knox/Ozone, producer Kafka PL6 result | 1d | Dev |
| 5 | Build NiFi flow `ingest-metadata` + `ingest-file-result` | 2d | Dev |
| 6 | admin-service: client Impala JDBC, tạo Iceberg table DDL khi thêm loại DL | 2d | Dev |
| 7 | admin-service: client NiFi API, deploy/start/stop flow | 2d | Dev |
| 8 | admin-service: client CM/Ranger/Atlas | 2d | Dev |
| 9 | share-service skeleton + Impala query qua Knox | 3d | Dev |
| 10 | E2E test: NHNN message → Kafka PL6 → Flink → Kafka CDP topic `TTDLQG_KHOMO_<MA_LOAI_DL>` → NiFi → Iceberg → Impala query | 2d | QA |
| 11 | Security L1 (Kerberos + Ranger) | 3d | Ops + Dev |
| 12 | Security L2 (TLS + Atlas governance) | 2d | Ops + Dev |
| 13 | Security L3 (encryption at-rest + KMS) | 2d | Ops |

**Tổng ~25d** cho full migration + production-ready.

---

## 12. Câu hỏi mở

1. Cloudera trial license bao lâu? Có đủ thời gian POC + production deploy?
2. NiFi deploy ở Edge node CDP (2 node) hay standalone Docker?
3. Schema Registry CFM hay tự deploy Confluent SR?
4. Phase nào enable Kerberos? L0 → L1 cần plan rõ.
5. Backup/DR plan cho Iceberg snapshot + Ozone data?
6. Tableau license cài node nào? Connect Impala qua Knox?
7. Bao nhiêu consumer dự kiến concurrent qua share-service? Sizing Impala daemon?
