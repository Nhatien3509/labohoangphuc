# 26.ĐMST.C12.TichHopChiaSe

Hệ thống tích hợp, chia sẻ dữ liệu phục vụ Trung tâm sáng tạo, khai thác dữ liệu.

## Mục tiêu

Repo này tập trung vào 3 nhóm năng lực chính:
- quản trị tích hợp và chia sẻ dữ liệu
- ingest/push/sync dữ liệu vào pipeline xử lý
- cung cấp nguồn dữ liệu mock để kiểm thử luồng end-to-end

## Thành phần chính

### 1. `srcs/dmst-admin-api`
Backend quản trị hệ thống.

Công nghệ chính:
- Go 1.26
- Gin
- GORM + PostgreSQL
- Kafka
- Kong Admin API
- Vault
- Zap
- Viper + Godotenv

Năng lực chính:
- quản lý route và route config
- quản lý Kafka topic
- đăng ký và kiểm tra schema
- quản lý người dân, audit log
- tích hợp Kong consumer/key/plugin
- đồng bộ Kho Mở theo lịch cron hoặc trigger thủ công

Entry point: `srcs/dmst-admin-api/cmd/api/main.go`

### 2. `srcs/dmst-ingest-svc`
Dịch vụ ingest dữ liệu.

Công nghệ chính:
- Go 1.26
- Gin
- GORM + PostgreSQL
- Kafka
- Redis
- OpenTelemetry + Zap

Năng lực chính:
- quản lý datasource
- trigger và theo dõi ingest job
- nhận dữ liệu push
- nhận dữ liệu Kho Mở từ admin service
- validate schema theo feature flag
- debug/quan sát Redis cho delta filtering

Entry point: `srcs/dmst-ingest-svc/cmd/ingest/main.go`

### 3. `srcs/dmst-mock-datasource`
Dịch vụ mock datasource để test local/e2e.

Năng lực chính:
- sinh dữ liệu seed trong bộ nhớ
- cung cấp API `projects`, `experts`, `submissions`
- health endpoint đơn giản

Entry point: `srcs/dmst-mock-datasource/cmd/main.go`

## Cấu trúc repo

```text
.
├── srcs/
│   ├── dmst-admin-api/
│   ├── dmst-ingest-svc/
│   └── dmst-mock-datasource/
├── deploy/
│   ├── docker/
│   ├── envs/
│   ├── scripts/
│   └── templates/
├── docs/
└── plans/
```

## Chạy nhanh

### Admin API
```bash
cd srcs/dmst-admin-api
go run cmd/api/main.go
```

### Ingest Service
```bash
cd srcs/dmst-ingest-svc
go run cmd/ingest/main.go
```

### Mock Datasource
```bash
cd srcs/dmst-mock-datasource
go run cmd/main.go
```

## Health endpoints

- Admin API: `GET /health`
- Ingest Service: `GET /health`
- Mock Datasource: `GET /health`

## Tài liệu

- `docs/project-overview-pdr.md` — mục tiêu, phạm vi, yêu cầu
- `docs/codebase-summary.md` — tóm tắt codebase
- `docs/code-standards.md` — chuẩn tổ chức code và tài liệu
- `docs/system-architecture.md` — kiến trúc hệ thống
- `docs/project-roadmap.md` — roadmap kỹ thuật
- `docs/deployment-guide.md` — hướng dẫn deploy
- `docs/design-guidelines.md` — guideline thiết kế API và service
- `docs/Huong-dan-chay-test.md` — hướng dẫn chạy test/thử luồng

## Lưu ý hiện trạng

- `docs/README.md` hiện chỉ mô tả `adm-srv-go-api`, không phản ánh đầy đủ toàn repo.
- `deploy/README.md` có nội dung portal-centric, không hoàn toàn khớp với cấu trúc deploy hiện tại của repo này.
- Một số tài liệu cũ vẫn hữu ích như tài liệu test và Postman collections, nhưng nên xem cùng bộ docs mới trong `docs/`.
