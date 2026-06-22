# Project Plan: Tích hợp NguoiDan với Vault Transit

## 1. Context & Objective
Triển khai tính năng quản lý `NguoiDan` với khả năng bảo mật dữ liệu nhạy cảm (Mã Số, Số CCCD) bằng HashiCorp Vault. Dữ liệu sẽ được mã hóa trước khi lưu vào database và giải mã khi truy xuất (Encryption-as-a-Service pattern).

## 2. Task Breakdown

### Phase 1: Data Access Layer
- **Model**: Tạo `internal/model/nguoi_dan.go`
  - Định nghĩa struct `NguoiDan` với struct tag `vault:"transit"` để đánh dấu các trường mã hóa.
  ```go
  type NguoiDan struct {
      ID          uint           `gorm:"primaryKey" json:"id"`
      MaSo        string         `gorm:"size:255;not null;unique" json:"ma_so" vault:"transit"`
      HoTen       string         `gorm:"size:255;not null" json:"ho_ten"`
      SoCCCD      string         `gorm:"size:255;not null;unique" json:"so_cccd" vault:"transit"`
      SoDienThoai string         `gorm:"size:20" json:"so_dien_thoai"`
      Gmail       string         `gorm:"size:255" json:"gmail"`
      CreatedAt   time.Time      `json:"created_at"`
      UpdatedAt   time.Time      `json:"updated_at"`
      DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
  }
  ```
- **Repository**: Tạo `internal/repository/nguoi_dan_repo.go`
  - Định nghĩa interface `NguoiDanRepository` (`Create`, `GetByID`, `GetAll`).
  - Tầng này hoàn toàn "ngây thơ" (chỉ giao tiếp GORM thuần), không biết hay quan tâm gì về việc mã hóa.

### Phase 2: Business Logic & Encryption Layer
- **Vault Service (Core Logic)**: Tạo `internal/service/vault_service.go`
  - Chịu trách nhiệm quét struct bằng `reflect`, lấy các fields có tag `vault:"transit"`.
  - Tối ưu hóa hiệu năng bằng cách gộp các tags thành payload chuyển đi qua **Vault Batch Transit API** (Batch Encrypt / Batch Decrypt).
- **Nguoi Dan Service**: Tạo `internal/service/nguoi_dan_service.go`
  - Ghép nối `VaultService` và `NguoiDanRepository`.
  - `Create`: Gọi `VaultService.EncryptStruct(&nguoiDan)` -> `Repo.Create()`.
  - `GetByID`: Gọi `Repo.GetByID()` -> `VaultService.DecryptStruct(&nguoiDan)`.
  - `GetAll`: Gọi `Repo.GetAll()` -> Gọi `VaultService.DecryptSlice(&listNguoiDan)` (hưởng lợi tối đa từ Batch API của Vault).

### Phase 3: Transport Layer (HTTP API)
- **Handler**: Tạo `internal/handler/nguoi_dan_handler.go`
  - Implement các API routes: `POST /nguoi-dan`, `GET /nguoi-dan`, `GET /nguoi-dan/:id`.
  - Validate payload đầu vào/đầu ra. Chuyển đổi HTTP Request thành lời gọi Service.

### Phase 4: Wiring & Registry
- **Main**: Cập nhật `cmd/api/main.go`
  - Thêm `model.NguoiDan{}` vào tiến trình `AutoMigrate`.
  - Khởi tạo `NguoiDanRepository`.
  - Khởi tạo `NguoiDanService` (inject db repo & vault client).
  - Khởi tạo `NguoiDanHandler` và cấu hình các gin routes `/api/v1/nguoi-dan`.

## 3. Agent Assignments
- **`@backend-specialist`**: Phụ trách viết mã Go cho Model, Repository, Service, Handler và Router wiring.
- **`@security-auditor`**: Review lại luồng mã hóa bảo đảm mã hóa ngay lập tức và giải mã an toàn, tối thiểu việc lộ secret ở memory.

## 4. Verification Checklist
- [ ] Model AutoMigrate sinh ra bảng dạng chuỗi varchar cho các field cần lưu ciphertext.
- [ ] API Create test thành công, verify dưới DB lưu định dạng `vault:v1:...`
- [ ] API Get Test thành công, lấy ra JSON trả về đúng plaintext.
- [ ] Route Error handling khi Vault Service đi offline phải an toàn (HTTP 500, không leak ciphertext thô gốc).
