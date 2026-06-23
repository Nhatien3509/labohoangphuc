package dto

import (
	"labohoangphuc/labo-warranty/internal/domain/entities"
	"time"
)

// AdminCreateWarrantyRequest hứng dữ liệu JSON từ Admin Panel gửi lên
type AdminCreateWarrantyRequest struct {
	CustomerName   string    `json:"customer_name" binding:"required"`
	CustomerPhone  string    `json:"customer_phone" binding:"required"`
	ClinicID       string    `json:"clinic_id" binding:"required,uuid"`  // Nhận dạng chuỗi UUID hợp lệ
	ProductID      string    `json:"product_id" binding:"required,uuid"` // Nhận dạng chuỗi UUID hợp lệ
	LabName        string    `json:"lab_name" binding:"required"`        // Thường mặc định là "Lab Hà Nội"
	ToothPositions []int64   `json:"tooth_positions" binding:"required"` // Mảng các vị trí răng [11, 12, 21]
	IssueDate      time.Time `json:"issue_date" binding:"required"`      // Ngày phát hành thẻ
	Note           string    `json:"note,omitempty"`                     // Ghi chú nếu có
}

// AdminWarrantyResponse trả về đầy đủ thông tin chi tiết cho Admin Panel sau khi tạo/xem
type AdminWarrantyResponse struct {
	ID             string                  `json:"id"`
	Code           string                  `json:"code"`
	CustomerName   string                  `json:"customer_name"`
	CustomerPhone  string                  `json:"customer_phone"`
	ClinicID       string                  `json:"clinic_id"`
	ProductID      string                  `json:"product_id"`
	LabName        string                  `json:"lab_name"`
	ToothPositions []int64                 `json:"tooth_positions"`
	WarrantyMonths int                     `json:"warranty_months"` // Đã snapshot tại thời điểm phát hành
	IssueDate      string                  `json:"issue_date"`      // Định dạng YYYY-MM-DD
	ExpiryDate     string                  `json:"expiry_date"`     // Định dạng YYYY-MM-DD
	Status         entities.WarrantyStatus `json:"status"`          // active, expired, revoked
	Note           string                  `json:"note,omitempty"`
	CreatedBy      string                  `json:"created_by,omitempty"` // ID của Admin/Staff thực hiện
	CreatedAt      time.Time               `json:"created_at"`
	UpdatedAt      time.Time               `json:"updated_at"`
}

type PublicWarrantyLookupResponse struct {
	Code           string  `json:"code"`            // MÃ SỐ THẺ (warranty_cards.code) [cite: 129]
	CustomerName   string  `json:"customer_name"`   // TÊN KHÁCH HÀNG (warranty_cards.customer_name) [cite: 129]
	ClinicName     string  `json:"clinic_name"`     // NHA KHOA (clinics.name thông qua clinic_id) [cite: 129]
	LabName        string  `json:"lab_name"`        // LAB (warranty_cards.lab_name) [cite: 129]
	ToothPositions []int64 `json:"tooth_positions"` // VỊ TRÍ RĂNG (warranty_cards.tooth_positions) [cite: 129]
	IssueDate      string  `json:"issue_date"`      // NGÀY PHÁT HÀNH (Định dạng chuỗi YYYY-MM-DD) [cite: 129]
	ExpiryDate     string  `json:"expiry_date"`     // NGÀY HẾT HẠN (Định dạng chuỗi YYYY-MM-DD) [cite: 129]
}
