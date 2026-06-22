# 03 — Tạo Data Source Metadata Theo Kho

Trong luồng mới, `data_source_metadata` không đại diện cho từng dataflow/topic. Nó là **template schema xử lý cho một kho dữ liệu**.

Ví dụ:

```text
TTDLQG -> ttdlqg-template
KHO_MO -> kho-mo-template
KHO_ABC -> kho-abc-template
```

Nếu một kho có nhiều mã loại dữ liệu nhưng cùng template schema, chỉ tạo một metadata template cho kho đó.

## TTDLQG Template

Kho TTDLQG có 2 kiểu dữ liệu:
- **Có file đính kèm** (`PhanPhoi` array không rỗng) — Flink sẽ trigger file download
- **Không có file** (`PhanPhoi` vắng mặt) — Flink tự skip, không làm gì thêm

Dùng chung 1 template với `fileDownloadEnabled=true`. `FileDownloadFunction` tự skip nếu `PhanPhoi` không có.

Tất cả fields dùng **PascalCase** theo Thông tư 08/2025/TT-BCA.

```bash
curl -X POST http://localhost:9080/api/v1/data-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ttdlqg-template",
    "description": "Template schema kho TTDLQG",
    "sourceFields": [
      {"name": "NguonDuLieu", "type": "json", "required": true},
      {"name": "NguonDuLieu.MaLoaiDuLieu", "type": "string", "required": true},
      {"name": "DuLieuTiepNhan", "type": "json", "required": true},
      {"name": "TrangThaiDuLieu", "type": "json", "required": false}
    ],
    "sinkFields": [
      {"sourceName": "NguonDuLieu", "sinkName": "NguonDuLieu"},
      {"sourceName": "DuLieuTiepNhan", "sinkName": "DuLieuTiepNhan"},
      {"sourceName": "TrangThaiDuLieu", "sinkName": "TrangThaiDuLieu"},
      {"sourceName": "NguonDuLieu.MaLoaiDuLieu", "sinkName": "MaLoaiDuLieu"}
    ],
    "validations": [
      {"fieldName": "NguonDuLieu.MaLoaiDuLieu", "ruleType": "required", "ruleValue": "true"},
      {"fieldName": "DuLieuTiepNhan", "ruleType": "required", "ruleValue": "true"}
    ],
    "kafkaStartingOffset": "latest",
    "fileDownloadEnabled": true,
    "fileFieldConfig": {
      "fileListPath": "DuLieuTiepNhan.PhanPhoi",
      "downloadRequestTopic": "FILE_DOWNLOAD_REQUEST_{maLoaiDuLieu}",
      "itemIdField": "MaDinhDanhDuLieu",
      "fileIdField": "Id",
      "tenTepField": "TenTep",
      "maLoaiDuLieuField": "MaLoaiDuLieu",
      "phienBanField": "PhienBan",
      "checkSumField": "MaKiemTra.GiaTri",
      "duongDanField": "DuongDanTaiXuong"
    }
  }'
```

## Lưu Ý Case-Insensitive

Validator, transformer, và file download function đều hỗ trợ **case-insensitive field lookup**. Datasource config dùng PascalCase nhưng message camelCase vẫn được xử lý đúng. Không cần tạo 2 datasource riêng cho 2 kiểu case.

## Quan Hệ Với Dataflow

Dataflow trên giao diện admin sẽ sinh Kong route và Kafka topic PL6, ví dụ:

```text
TH_TTDLQG_G03
TH_TTDLQG_G02_001
```

Các topic này dùng chung `metadata.id=ttdlqg-template` khi Flink job đọc pattern:

```text
kafka.source.topic.pattern=TH_TTDLQG_.*
```

Topic CDP dùng nguyên source topic name — không cần config prefix/field. `TH_TTDLQG_G03` → CDP topic `TH_TTDLQG_G03`.

## Verify

```bash
curl http://localhost:9080/api/v1/data-sources/name/ttdlqg-template
```
