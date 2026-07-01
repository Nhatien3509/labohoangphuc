package dto

import (
	"labohoangphuc/labo-warranty/internal/domain/entities"
	"time"
)

// AdminCreateWarrantyRequest hứng dữ liệu JSON từ Admin Panel gửi lên
type AdminCreateWarrantyRequest struct {
	Code           string    `json:"code" binding:"required"` // Mã thẻ do admin nhập (bắt buộc)
	CustomerName   string    `json:"customer_name" binding:"required"`
	ClinicName     string    `json:"clinic_name" binding:"required"`             // NHA KHOA (nhập tự do, thay cho số điện thoại)
	LabName        string    `json:"lab_name" binding:"required"`               // Thường mặc định là "Lab Hà Nội"
	ToothPositions []int64   `json:"tooth_positions" binding:"required"`        // Mảng các vị trí răng [11, 12, 21]
	WarrantyMonths int       `json:"warranty_months" binding:"omitempty,min=1"` // Số tháng bảo hành; bỏ trống -> mặc định 84
	IssueDate      time.Time `json:"issue_date" binding:"required"`             // Ngày phát hành thẻ
	Note           string    `json:"note,omitempty"`                            // Ghi chú nếu có
}

// CodeCheckResponse trả về cho API kiểm tra trùng mã thẻ
type CodeCheckResponse struct {
	Exists bool `json:"exists"`
}

// AdminUpdateWarrantyRequest hứng dữ liệu khi Admin sửa thẻ (cho phép đổi cả mã và trạng thái)
type AdminUpdateWarrantyRequest struct {
	Code           string                  `json:"code" binding:"required"`
	CustomerName   string                  `json:"customer_name" binding:"required"`
	ClinicName     string                  `json:"clinic_name" binding:"required"`
	LabName        string                  `json:"lab_name" binding:"required"`
	ToothPositions []int64                 `json:"tooth_positions" binding:"required"`
	WarrantyMonths int                     `json:"warranty_months" binding:"omitempty,min=1"`
	IssueDate      time.Time               `json:"issue_date" binding:"required"`
	Status         entities.WarrantyStatus `json:"status" binding:"required,oneof=active expired revoked"`
	Note           string                  `json:"note,omitempty"`
}

// AdminWarrantyResponse trả về đầy đủ thông tin chi tiết cho Admin Panel sau khi tạo/xem
type AdminWarrantyResponse struct {
	ID             string                  `json:"id"`
	Code           string                  `json:"code"`
	CustomerName   string                  `json:"customer_name"`
	ClinicName     string                  `json:"clinic_name"`
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

// WarrantyMonthlyStat: số liệu 1 tháng cho biểu đồ dashboard.
type WarrantyMonthlyStat struct {
	Month string `json:"month"` // "YYYY-MM"
	New   int    `json:"new"`   // Số thẻ tạo mới trong tháng
	Total int    `json:"total"` // Tổng số thẻ luỹ kế đến hết tháng
}

// WarrantyStatsResponse: thống kê tổng quan cho trang dashboard admin.
type WarrantyStatsResponse struct {
	Total        int                   `json:"total"`          // Tổng số thẻ
	Active       int                   `json:"active"`         // Đang hoạt động
	Expired      int                   `json:"expired"`        // Hết hạn
	Revoked      int                   `json:"revoked"`        // Đã thu hồi
	NewThisMonth int                   `json:"new_this_month"` // Thẻ tạo mới tháng này
	NewThisYear  int                   `json:"new_this_year"`  // Thẻ tạo mới năm nay
	Monthly      []WarrantyMonthlyStat `json:"monthly"`        // 12 tháng gần nhất
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
