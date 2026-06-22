# Hướng dẫn: Ingest dữ liệu từ Kafka CDP vào HDFS Iceberg qua NiFi

## Tổng quan

```
Kafka CDP (topic) → NiFi → HDFS (Iceberg table)
```

NiFi flow: `ConsumeKafka_2_0` → `EvaluateJsonPath` → `AttributesToJSON` → `PutIceberg`

---

## Yêu cầu

- NiFi 1.27.0 có NAR: `nifi-iceberg-processors-nar-1.27.0.nar` trong thư mục `extensions/`
- CDH 7.1.7 với Hive Metastore (HMS) tại `thrift://centos-8-01.novalocal:9083`
- JAR Iceberg trong auxlib HMS: `/opt/cloudera/parcels/CDH/lib/hive/auxlib/iceberg-hive-runtime-0.13.2.jar`
- Ranger đã cấp quyền cho user `nifi` trên database `zone2`

---

## Bước 1: Tạo Iceberg table trên Hive

Vào **Hue → Hive editor**, chạy:

```sql
CREATE TABLE zone2.TEN_BANG (
  truong_1    STRING,
  truong_2    STRING,
  -- ... các trường cần extract
  raw_json    STRING    -- lưu toàn bộ JSON gốc
)
STORED BY 'org.apache.iceberg.mr.hive.HiveIcebergStorageHandler'
LOCATION '/data/zone2/MA_CAP_CHA/MA_HT_NGUON/MA_LOAI_DL';
```

> Không cần `ADD JAR` nếu JAR đã có trong HMS auxlib.

---

## Bước 2: Cấp quyền Ranger

### 2.1 Hadoop SQL (cho HMS)

Ranger UI → **Hadoop SQL** → Add New Policy:

| Field | Giá trị |
|-------|---------|
| Database | `zone2` |
| Table | `*` |
| Column | `*` |
| User | `nifi` |
| Permissions | All |

### 2.2 HDFS (cho data files)

Ranger UI → **HDFS** → Add New Policy:

| Field | Giá trị |
|-------|---------|
| Resource Path | `/data/zone2/*` |
| User | `nifi` |
| Permissions | Read, Write, Execute |
| Recursive | Yes |

Thêm policy thứ 2 cho warehouse (Iceberg metadata):

| Resource Path | `/warehouse/tablespace/*` |
|---------------|--------------------------|
| User | `nifi` |
| Permissions | Read, Write, Execute |
| Recursive | Yes |

### 2.3 Tắt HMS pre-event listener (bắt buộc với CDH 7.1.7)

Cloudera Manager → **Hive → Configuration → Safety Valve** → `hive-metastore-config-safety-valve`:

```
Name:  hive.metastore.pre.event.listeners
Value: (để trống)
```

Save → Restart Hive Metastore Server.

> **Lý do:** CDH 7.1.7 HMS gọi `getURIForAuth()` trên storage handler khi commit Iceberg. Iceberg open-source 0.13.2 không có method này → HMS trả `null://null` → Ranger deny với lỗi `RWSTORAGE`. Xóa listener là workaround cần thiết.

---

## Bước 3: Cấu hình NiFi Controller Services

### 3.1 HiveCatalogService

| Property | Giá trị |
|----------|---------|
| Metastore URI | `thrift://centos-8-01.novalocal:9083` |
| Catalog Namespace | `zone2` |
| Table Name | `TEN_BANG` |

### 3.2 JsonTreeReader

Tạo mới, để mặc định. Dùng làm Record Reader cho PutIceberg.

---

## Bước 4: Cấu hình NiFi processors

### ConsumeKafka_2_0

| Property | Giá trị |
|----------|---------|
| Kafka Brokers | `160.191.32.149:9092` |
| Topic Name(s) | `TEN_TOPIC` |
| Group ID | `nifi-ingest-v3` |
| Security Protocol | `PLAINTEXT` |
| SASL Mechanism | `GSSAPI` |

### EvaluateJsonPath

| Property | Giá trị |
|----------|---------|
| Destination | `flowfile-attribute` |
| Return Type | `json` |

Thêm các attribute mapping theo cấu trúc JSON của message. Ví dụ với KHOMO DL001:

| Attribute name | JSONPath |
|----------------|----------|
| `id_nguon_du_lieu` | `$.nguonDuLieu.idNguonDuLieu` |
| `ten_nguon_du_lieu` | `$.nguonDuLieu.tenNguonDuLieu` |
| `ma_loai_du_lieu` | `$.nguonDuLieu.maLoaiDuLieu` |
| `ma_dinh_danh` | `$.maDinhDanhDuLieu` |
| `phien_ban` | `$.phienBan` |
| `ngay_hieu_luc` | `$.trangThaiDuLieu.ngayHieuLuc` |
| `thoi_gian_cap_nhat` | `$.trangThaiDuLieu.thoiGianCapNhat` |
| `tieu_de` | `$.duLieuTiepNhan.tieuDe` |
| `mo_ta` | `$.duLieuTiepNhan.moTa` |
| `ngay_phat_hanh` | `$.duLieuTiepNhan.ngayPhatHanh` |
| `trang_thai` | `$.duLieuTiepNhan.trangThai` |
| `raw_json` | `$` |

Relationships: tick **matched** và **unmatched** → connect tới AttributesToJSON.

### AttributesToJSON

| Property | Giá trị |
|----------|---------|
| Destination | `flowfile-content` |
| Attributes List | `id_nguon_du_lieu,ten_nguon_du_lieu,ma_loai_du_lieu,ma_dinh_danh,phien_ban,ngay_hieu_luc,thoi_gian_cap_nhat,tieu_de,mo_ta,ngay_phat_hanh,trang_thai,raw_json` |
| Include Core Attributes | `false` |

Relationship: **success** → connect tới PutIceberg.

### PutIceberg

| Property | Giá trị |
|----------|---------|
| Catalog Services | HiveCatalogService (đã tạo) |
| Record Reader | JsonTreeReader (đã tạo) |

Relationships: **failure** → Auto-terminate. **success** → connect hoặc Auto-terminate.

---

## Bước 5: Reset offset và chạy flow

```bash
# Stop tất cả processors trước khi reset
ssh DMST-CLOUDERA-DEV 'docker exec thcs-cloudera-nifi bash -c \
  "kafka-consumer-groups.sh \
   --bootstrap-server 160.191.32.149:9092 \
   --group nifi-ingest-v3 \
   --topic TEN_TOPIC \
   --reset-offsets --to-earliest --execute"'
```

Start tất cả processors. Kiểm tra NiFi Data Provenance — không còn DROP event.

---

## Bước 6: Kiểm tra dữ liệu

### Kiểm tra HDFS

Vào HDFS Browser: `/data/zone2/.../data/` — phải có file `.parquet`.

### Query Hive (Hue → Hive editor)

```sql
SELECT * FROM zone2.TEN_BANG LIMIT 10;
SELECT COUNT(*) FROM zone2.TEN_BANG;
```

> Impala 3.4 (CDH 7.1.7) không support Iceberg. Chỉ query được qua Hive.

---

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `RWSTORAGE privilege on [null://null]` | HMS pre-event listener gọi `getURIForAuth()` không có trong Iceberg 0.13.2 | Xóa `hive.metastore.pre.event.listeners` trong CM Safety Valve |
| `Cannot find field with name 'X' in record schema` | JSON nested, field name không khớp schema | Dùng EvaluateJsonPath extract từng field ra attribute |
| `JsonParseException: Unexpected character '}'` | ReplaceText escape JSON sai | Dùng AttributesToJSON thay ReplaceText |
| `ConsumeKafka Out=0` | Offset đã committed | Stop processor → reset offset → Start |
| `Permission denied: user [nifi]` | Ranger chưa có policy | Thêm Hadoop SQL policy cho user nifi trên database zone2 |
