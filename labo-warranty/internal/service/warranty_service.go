package service

import (
	"context"
	"errors"
	"labohoangphuc/labo-warranty/internal/domain/dto"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/repository"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type WarrantyService interface {
	// Nghiệp vụ dành cho Admin/Staff phát hành thẻ
	CreateCard(ctx context.Context, req *dto.AdminCreateWarrantyRequest, adminID string) (*dto.AdminWarrantyResponse, error)

	// Danh sách thẻ cho Admin panel
	ListCards(ctx context.Context, page, limit int) ([]*dto.AdminWarrantyResponse, error)

	// Kiểm tra mã thẻ đã tồn tại hay chưa (Admin)
	CodeExists(ctx context.Context, code string) (bool, error)

	// Xem chi tiết / sửa / xoá thẻ (Admin)
	GetCard(ctx context.Context, id string) (*dto.AdminWarrantyResponse, error)
	UpdateCard(ctx context.Context, id string, req *dto.AdminUpdateWarrantyRequest) (*dto.AdminWarrantyResponse, error)
	DeleteCard(ctx context.Context, id string) error

	// Nghiệp vụ dành cho Khách vãng lai tra cứu công khai (có ghi nhật ký bất đồng bộ)
	PublicLookup(ctx context.Context, code string, ipAddress, userAgent string) (*dto.PublicWarrantyLookupResponse, error)
}

type warrantyService struct {
	wr repository.WarrantyRepository
}

func NewWarrantyService(wr repository.WarrantyRepository) WarrantyService {
	return &warrantyService{wr: wr}
}

func (ws *warrantyService) CreateCard(ctx context.Context, req *dto.AdminCreateWarrantyRequest, adminID string) (*dto.AdminWarrantyResponse, error) {
	adminUUID, _ := uuid.Parse(adminID)

	// Mã thẻ: admin có thể tự nhập tuỳ ý; bỏ trống thì để repository tự sinh.
	code := strings.TrimSpace(req.Code)

	// Số tháng bảo hành lấy từ request; bỏ trống thì mặc định 84 tháng.
	warrantyMonths := req.WarrantyMonths
	if warrantyMonths <= 0 {
		warrantyMonths = 84
	}
	expiryDate := req.IssueDate.AddDate(0, warrantyMonths, 0)
	// ClinicID / ProductID để nil -> lưu NULL (đã bỏ khỏi nghiệp vụ tạo thẻ).
	cardEntity := &entities.WarrantyCard{
		Code:           code,
		CustomerName:   req.CustomerName,
		CustomerPhone:  &req.CustomerPhone,
		LabName:        req.LabName,
		ToothPositions: pq.Int64Array(req.ToothPositions),
		WarrantyMonths: warrantyMonths,
		IssueDate:      req.IssueDate,
		ExpiryDate:     expiryDate,
		Status:         entities.StatusActive,
		CreatedBy:      &adminUUID,
		Note:           &req.Note,
	}

	if err := ws.wr.CreateCard(ctx, cardEntity); err != nil {
		return nil, err
	}
	return ToAdminWarrantyResponse(cardEntity), nil
}

func (ws *warrantyService) ListCards(ctx context.Context, page, limit int) ([]*dto.AdminWarrantyResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit

	cards, err := ws.wr.ListCards(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.AdminWarrantyResponse, 0, len(cards))
	for _, card := range cards {
		res = append(res, ToAdminWarrantyResponse(card))
	}
	return res, nil
}

func (ws *warrantyService) CodeExists(ctx context.Context, code string) (bool, error) {
	code = strings.TrimSpace(code)
	if code == "" {
		return false, nil
	}
	_, err := ws.wr.FindByCode(ctx, code)
	if err != nil {
		if errors.Is(err, errs.ErrCardNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (ws *warrantyService) GetCard(ctx context.Context, id string) (*dto.AdminWarrantyResponse, error) {
	card, err := ws.wr.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToAdminWarrantyResponse(card), nil
}

func (ws *warrantyService) UpdateCard(ctx context.Context, id string, req *dto.AdminUpdateWarrantyRequest) (*dto.AdminWarrantyResponse, error) {
	// Lấy bản ghi hiện có để giữ nguyên created_at/created_by, chỉ sửa các trường cho phép.
	card, err := ws.wr.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	warrantyMonths := req.WarrantyMonths
	if warrantyMonths <= 0 {
		warrantyMonths = card.WarrantyMonths
	}

	card.Code = strings.TrimSpace(req.Code)
	card.CustomerName = req.CustomerName
	card.CustomerPhone = &req.CustomerPhone
	card.LabName = req.LabName
	card.ToothPositions = pq.Int64Array(req.ToothPositions)
	card.WarrantyMonths = warrantyMonths
	card.IssueDate = req.IssueDate
	card.ExpiryDate = req.IssueDate.AddDate(0, warrantyMonths, 0)
	card.Status = req.Status
	card.Note = &req.Note

	if err := ws.wr.UpdateCard(ctx, card); err != nil {
		return nil, err
	}

	return ToAdminWarrantyResponse(card), nil
}

func (ws *warrantyService) DeleteCard(ctx context.Context, id string) error {
	// Đảm bảo thẻ tồn tại trước khi xoá (trả về lỗi không tìm thấy nếu không có).
	if _, err := ws.wr.FindByID(ctx, id); err != nil {
		return err
	}
	return ws.wr.DeleteCard(ctx, id)
}

func ToAdminWarrantyResponse(m *entities.WarrantyCard) *dto.AdminWarrantyResponse {
	// Khởi tạo DTO với các trường dữ liệu cơ bản chắc chắn không NULL
	res := &dto.AdminWarrantyResponse{
		ID:             m.ID.String(),
		Code:           m.Code,
		CustomerName:   m.CustomerName,
		LabName:        m.LabName,
		ToothPositions: m.ToothPositions,
		WarrantyMonths: m.WarrantyMonths,
		// Định dạng ngày tháng sang chuỗi YYYY-MM-DD theo yêu cầu đặc tả giao diện (UI Spec)
		IssueDate:  m.IssueDate.Format("2006-01-02"),
		ExpiryDate: m.ExpiryDate.Format("2006-01-02"),
		Status:     m.Status,
		CreatedAt:  m.CreatedAt,
		UpdatedAt:  m.UpdatedAt,
	}

	// Kiểm tra an toàn các trường kiểu con trỏ (có thể mang giá trị NULL trong DB)
	// trước khi gọi hàm lấy dữ liệu để tránh lỗi "nil pointer dereference" (panic sập nguồn Go)
	if m.CustomerPhone != nil {
		res.CustomerPhone = *m.CustomerPhone
	}

	if m.CreatedBy != nil {
		res.CreatedBy = m.CreatedBy.String()
	}

	if m.Note != nil {
		res.Note = *m.Note
	}

	return res
}

func (ws *warrantyService) PublicLookup(ctx context.Context, code string, ipAddress, userAgent string) (*dto.PublicWarrantyLookupResponse, error) {
	// Mã thẻ nhập tuỳ ý nên chỉ kiểm tra cơ bản (không rỗng, độ dài hợp lý);
	// không khớp dữ liệu thì trả "không tìm thấy" như bình thường.
	code = strings.TrimSpace(code)
	if code == "" || len(code) > 64 {
		return nil, errs.ErrInvalidCodeFormat
	}

	card, err := ws.wr.FindByCode(ctx, code)
	isFound := true
	if err != nil {
		if errors.Is(err, errs.ErrCardNotFound) {
			isFound = false
		} else {
			return nil, err
		}
	}

	if isFound && card.Status == entities.StatusRevoked {
		isFound = false
	}

	go func(code string, found bool, ip, ua string) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		lookupLog := &entities.WarrantyLookup{
			Code:      code,
			Found:     found,
			IPAddress: &ip,
			UserAgent: &ua,
		}
		if logErr := ws.wr.LogLookup(bgCtx, lookupLog); logErr != nil {
			log.Printf("[Warning] Không thể ghi nhật ký tra cứu cho mã %s: %v", code, logErr)
		}
	}(code, isFound, ipAddress, userAgent)

	if !isFound {
		return nil, errs.ErrCardNotFound
	}

	clinicName := "Nha khoa Smile" // Du lieu tam
	return ToPublicWarrantyLookupResponse(card, clinicName), nil
}

func ToPublicWarrantyLookupResponse(card *entities.WarrantyCard, clinicName string) *dto.PublicWarrantyLookupResponse {
	return &dto.PublicWarrantyLookupResponse{
		Code:           card.Code,
		CustomerName:   card.CustomerName,
		ClinicName:     clinicName, // Tên nha khoa lấy từ bảng clinics thông qua tham số truyền vào từ tầng Service
		LabName:        card.LabName,
		ToothPositions: card.ToothPositions,
		IssueDate:      card.IssueDate.Format("2006-01-02"),
		ExpiryDate:     card.ExpiryDate.Format("2006-01-02"),
	}
}
