# Kế hoạch triển khai xử lý Kho Mở Receive

**Mục tiêu**: Cập nhật endpoint `/api/v1/kho-mo/receive` của service `dmst-integration-ingest` để đáp ứng các yêu cầu:
1. Lưu toàn bộ thông tin payload nhận được vào cơ sở dữ liệu (PostgreSQL).
2. Chỉ publish phần `dataNguonDuLieu` lên Kafka thay vì toàn bộ payload.
3. Sử dụng trường `traceId` làm `Key` cho Kafka message.
4. Tuân thủ Clean Architecture (tách riêng Handler, Service, Repository, Model).

> [!WARNING]
> Kế hoạch này yêu cầu xác nhận về hành vi của Schema Validation. Vui lòng kiểm tra phần **Open Questions** bên dưới.

---

## ❓ Open Questions

> [!IMPORTANT]
> **Schema Validation sẽ áp dụng cho phần nào?**
> Hiện tại, thư viện đang validate **toàn bộ payload** (bao gồm `succeeded`, `page`, `size`...). 
> Tuy nhiên, do yêu cầu "chỉ bắn sang Kafka 'data'", tôi cần xác nhận:
> 1. Avro Schema trên Registry hiện tại (`kho-du-lieu-mo-value`) định nghĩa cấu trúc của toàn bộ payload hay chỉ riêng phần `data`?
> 2. Nếu Avro schema vẫn là cấu trúc của toàn bộ payload, tôi sẽ vẫn validate toàn bộ payload, sau đó chỉ cắt phần `dataNguonDuLieu` để publish. Điều này có đúng ý bạn không?

---

## 🛠️ Cấu trúc thay đổi (Proposed Changes)

### 1. `internal/model/kho_mo.go`
Định nghĩa struct cho Database và request payload.

#### [NEW] `internal/model/kho_mo.go`
```go
package model

import "time"

// KhoMoReceivePayload dùng để parse JSON body từ adm-srv-go-api.
type KhoMoReceivePayload struct {
	Succeeded       bool     `json:"succeeded"`
	Errors          []string `json:"errors"`
	TraceId         string   `json:"traceId"`
	Page            int32    `json:"page"`
	Size            int32    `json:"size"`
	Count           int32    `json:"count"`
	DataNguonDuLieu string   `json:"dataNguonDuLieu"`
}

// JobRunLog lưu trữ lịch sử nhận dữ liệu vào database.
type JobRunLog struct {
	ID              uint      `gorm:"primarykey"`
	TraceId         string    `gorm:"index;type:varchar(255)" json:"traceId"`
	Succeeded       bool      `json:"succeeded"`
	Errors          string    `gorm:"type:text" json:"errors"` // Lưu mảng lỗi dưới dạng JSON string
	Page            int32     `json:"page"`
	Size            int32     `json:"size"`
	Count           int32     `json:"count"`
	DataNguonDuLieu string    `gorm:"type:jsonb" json:"dataNguonDuLieu"`
	CreatedAt       time.Time `json:"createdAt"`
}
```

---

### 2. `internal/repository/kho_mo_log_repo.go`
Tạo class repository để quản lý tương tác database, giữ clean code.

#### [NEW] `internal/repository/kho_mo_log_repo.go`
```go
package repository

import (
	"context"
	"dmst-integration-ingest/internal/model"
	"gorm.io/gorm"
)

type JobRunLogRepository interface {
	Create(ctx context.Context, log *model.JobRunLog) error
}

type jobRunLogRepo struct {
	db *gorm.DB
}

func NewJobRunLogRepository(db *gorm.DB) JobRunLogRepository {
	return &jobRunLogRepo{db: db}
}

func (r *jobRunLogRepo) Create(ctx context.Context, log *model.JobRunLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}
```

---

### 3. `internal/service/kho_mo_service.go`
Cập nhật service để:
- Parse `payload []byte` thành `KhoMoReceivePayload`.
- Gọi repository lưu vào Database.
- Thiết lập `Key` và `Value` chuẩn cho Kafka message.

#### [MODIFY] `internal/service/kho_mo_service.go`
* **Dependency Injection**: Bổ sung `JobRunLogRepository` vào constructor `NewKhoMoService`.
* **Process Flow**:
  1. Unmarshal `payload` bytes thành `KhoMoReceivePayload`.
  2. Map sang `JobRunLog` (chuyển mảng errors sang JSON string) và lưu database `repo.Create()`.
  3. Validate Schema: Vẫn truyền `payload` gốc vào `validator.Validate()`.
  4. Publish Kafka:
     ```go
     msg := kafka.Message{
         Topic: s.kafkaTopic,
         Key:   []byte(parsed.TraceId),           // Thêm key là traceId
         Value: []byte(parsed.DataNguonDuLieu),   // Chỉ bắn phần data sang Kafka
     }
     ```

---

### 4. `cmd/ingest/main.go`
Cập nhật wiring dependencies và database migration.

#### [MODIFY] `cmd/ingest/main.go`
1. Khai báo AutoMigrate cho model mới:
   ```go
   if err := db.AutoMigrate(&model.Datasource{}, &model.Job{}, &model.JobRunLog{}); err != nil {
   ```
2. Khởi tạo `JobRunLogRepository`.
3. Bổ sung `JobRunLogRepository` vào `NewKhoMoService`.

---

## ✅ Tiêu chí hoàn thành (Verification Plan)
1. **Database Check**: Khi trigger `/api/v1/kho-mo/receive`, một bản ghi mới xuất hiện trong bảng `job_run_logs` của Postgres với đầy đủ `traceId`, `page`, `dataNguonDuLieu` ở dạng JSONB.
2. **Kafka Message Check**: Ghi nhận message tại topic `dmst.kho-mo.raw`. Key của message là `traceId` (vd: `03795661...`), Value là chuỗi `{"items":[...]}` (không chứa `succeeded`, `page`...).
3. **Clean Code**: Database thao tác thông qua Repository, không viết logic query ở Handler hoặc Service. Code build thành công ở cả hai project.
