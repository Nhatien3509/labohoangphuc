package entities

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type WarrantyStatus string

const (
	StatusActive  WarrantyStatus = "active"  // Đang hiệu lực
	StatusExpired WarrantyStatus = "expired" // Hết hạn
	StatusRevoked WarrantyStatus = "revoked" // Admin thu hồi
)

type WarrantyCard struct {
	ID             uuid.UUID      `db:"id" json:"id"`
	Code           string         `db:"code" json:"code"`
	CustomerName   string         `db:"customer_name" json:"customer_name"`
	CustomerPhone  *string        `db:"customer_phone" json:"-"` // Ẩn hoàn toàn khỏi JSON khi public tra cứu [cite: 493, 567]
	ClinicID       *uuid.UUID     `db:"clinic_id" json:"clinic_id,omitempty"`
	ProductID      uuid.UUID      `db:"product_id" json:"product_id"`
	LabName        string         `db:"lab_name" json:"lab_name"`
	Quantity       int            `db:"quantity" json:"quantity"`
	ToothPositions pq.Int64Array  `db:"tooth_positions" json:"tooth_positions"` // Kiểu slice thuần của Go, pgx/v5 tự động hỗ trợ map từ int[]
	WarrantyMonths int            `db:"warranty_months" json:"warranty_months"` // Snapshot tại thời điểm phát hành [cite: 65, 514]
	IssueDate      time.Time      `db:"issue_date" json:"issue_date"`
	ExpiryDate     time.Time      `db:"expiry_date" json:"expiry_date"`
	Status         WarrantyStatus `db:"status" json:"status"`
	Note           *string        `db:"note" json:"note,omitempty"`
	CreatedBy      *uuid.UUID     `db:"created_by" json:"-"`
	CreatedAt      time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time      `db:"updated_at" json:"updated_at"`
}

// PublicWarrantyResponse DTO dùng để trả về đúng 7 trường yêu cầu hiển thị ở UI tra cứu công khai [cite: 128, 129]
type PublicWarrantyResponse struct {
	Code           string  `json:"code"`            // MÃ SỐ THẺ [cite: 129]
	CustomerName   string  `json:"customer_name"`   // TÊN KHÁCH HÀNG [cite: 129]
	ClinicName     string  `json:"clinic_name"`     // NHA KHOA [cite: 129]
	LabName        string  `json:"lab_name"`        // LAB [cite: 129]
	ToothPositions []int64 `json:"tooth_positions"` // VỊ TRÍ RĂNG [cite: 129]
	IssueDate      string  `json:"issue_date"`      // NGÀY PHÁT HÀNH (Định dạng YYYY-MM-DD) [cite: 129]
	ExpiryDate     string  `json:"expiry_date"`     // NGÀY HẾT HẠN (Định dạng YYYY-MM-DD) [cite: 129]
}

// WarrantyFilter cấu trúc nhận tham số lọc danh sách cho Admin panel [cite: 148, 545]
type WarrantyFilter struct {
	Query     string
	ClinicID  *uuid.UUID
	ProductID *uuid.UUID
	Status    string
	FromDate  *time.Time
	ToDate    *time.Time
	Page      int
	Limit     int
}

// WarrantyRepository Interface tách rời phục vụ Unit Test / Mocking [cite: 540, 541]
type WarrantyRepository interface {
	FindByCode(ctx context.Context, code string) (*WarrantyCard, error)
	Create(ctx context.Context, c *WarrantyCard) error
	Update(ctx context.Context, c *WarrantyCard) error
	List(ctx context.Context, f WarrantyFilter) ([]*WarrantyCard, int, error)
	NextCode(ctx context.Context, year int) (string, error)
}
