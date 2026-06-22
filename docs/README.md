# Admin Service Go API (adm-srv-go-api)

Dịch vụ backend quản trị hệ thống Tích hợp & Chia sẻ dữ liệu (26.ĐMST.C12).

## Công nghệ sử dụng
- **Go 1.26.2**
- **Gin Web Framework**
- **GORM** (PostgreSQL)
- **kafka-go** (Kafka Admin)
- **Zap** (Logging)
- **Viper & Godotenv** (Configuration)

## Cấu trúc thư mục
- `cmd/api/`: Entry point của ứng dụng.
- `internal/config/`: Xử lý cấu hình từ environment variables.
- `internal/handler/`: HTTP handlers nhận request và trả response.
- `internal/model/`: Định nghĩa các thực thể (Entities/Structs).
- `internal/repository/`: Tương tác trực tiếp với cơ sở dữ liệu.
- `internal/service/`: Chứa logic nghiệp vụ cốt lõi.
- `pkg/logger/`: Wrapper cho Zap logger.
- `test/`: Các bài kiểm tra tích hợp (Integration tests).

## Hướng dẫn cài đặt

1. **Sao chép file cấu hình:**
   ```bash
   cp .env.example .env
   ```
   Sau đó cập nhật thông tin DB và Kafka trong file `.env`.

2. **Cài đặt dependencies:**
   ```bash
   go mod tidy
   ```

3. **Chạy ứng dụng:**
   ```bash
   go run cmd/api/main.go
   ```

4. **Xây dựng Docker image:**
   ```bash
   docker build -t adm-srv-go-api .
   ```

5. **Chạy với Docker Compose:**
   ```bash
   docker compose up -d
   ```

## API Endpoints

### Health Check
- `GET /health`: Kiểm tra trạng thái service.

### API Routes Management
- `GET /api/v1/routes`: Danh sách routes.
- `POST /api/v1/routes`: Tạo mới route.
- `GET /api/v1/routes/:id`: Chi tiết route.
- `PUT /api/v1/routes/:id`: Cập nhật route.
- `DELETE /api/v1/routes/:id`: Xóa route.

### Kafka Topic Management
- `GET /api/v1/kafka/topics`: Danh sách Kafka topics.
- `POST /api/v1/kafka/topics`: Khởi tạo Kafka topic mới.

## Chạy Kiểm thử
```bash
go test ./test/... -v
```
