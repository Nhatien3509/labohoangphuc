# sharing-service

Share API luồng bản sao (REPLICA) — đọc Hive **zone2**, ghi log vào `sharing_access_logs`.

## API

```http
POST /api/sharing/share?ma_cau_hinh=th_TTDLQG_G02_G02_001&page=1&page_size=20
Content-Type: application/json

{
  "list_fields": ["col1", "col2"],
  "domain": "REPLICA",
  "source_system_code": "SYS_A",
  "source_system_ip": "10.0.0.1"
}
```

- Query `ma_cau_hinh` (bắt buộc, đã gồm prefix `th_`) → bảng `{REPLICA_ZONE}.{ma_cau_hinh}`.
- Body: `domain`, `source_system_code`, `source_system_ip` bắt buộc; `list_fields` optional.
- Mỗi lần gọi API (thành công **hoặc lỗi**) → ghi 1 dòng log.
- Lỗi: `http_status` + `error_message` (nội dung trường `error` trả về client).
- Thành công: `record_count` = số dòng trả về, `error_message` rỗng.

## Bảng log `sharing_access_logs`

| Cột | Mô tả |
|-----|--------|
| ma_cau_hinh | Mã cấu hình (query) |
| domain, source_system_code, source_system_ip | Từ body (nếu parse được) |
| list_fields | JSON array |
| hive_table, page, page_size | Ngữ cảnh request |
| http_status | HTTP status trả về |
| error_message | Message lỗi (rỗng nếu OK) |
| record_count | Số bản ghi trả về (0 nếu lỗi) |
| created_at | Thời điểm ghi |

## Chạy local

```bash
cp .env.example .env
go run ./cmd/server
```
