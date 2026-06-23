package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"labohoangphuc/labo-warranty/internal/domain/dto"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/repository"
	"log"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var WarrantyCard = "warranty:card:"

type WarrantyService interface {
	// Nghiệp vụ dành cho Admin/Staff phát hành thẻ
	CreateCard(ctx context.Context, req *dto.AdminCreateWarrantyRequest, adminID string) (*dto.AdminWarrantyResponse, error)

	// Nghiệp vụ dành cho Khách vãng lai tra cứu công khai (Có tích hợp Redis Cache + Async Log)
	PublicLookup(ctx context.Context, code string, ipAddress, userAgent string) (*dto.PublicWarrantyLookupResponse, error)
}

type warrantyService struct {
	wr        repository.WarrantyRepository
	rdb       *redis.Client
	codeRegex *regexp.Regexp
}

func NewWarrantyService(wr repository.WarrantyRepository, rdb *redis.Client) WarrantyService {
	return &warrantyService{
		wr:        wr,
		rdb:       rdb,
		codeRegex: regexp.MustCompile(`^BH-\d+$`),
	}
}

func (ws *warrantyService) CreateCard(ctx context.Context, req *dto.AdminCreateWarrantyRequest, adminID string) (*dto.AdminWarrantyResponse, error) {
	clinicUUID, err := uuid.Parse(req.ClinicID)
	if err != nil {
		return nil, fmt.Errorf("định dạng clinic_id không hợp lệ")
	}
	productUUID, err := uuid.Parse(req.ProductID)
	if err != nil {
		return nil, fmt.Errorf("định dạng product_id không hợp lệ")
	}
	adminUUID, _ := uuid.Parse(adminID)

	warrantyMonths := 84
	expiryDate := req.IssueDate.AddDate(0, warrantyMonths, 0)
	cardEntity := &entities.WarrantyCard{
		CustomerName:   req.CustomerName,
		CustomerPhone:  &req.CustomerPhone,
		ClinicID:       &clinicUUID,
		ProductID:      productUUID,
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

func ToAdminWarrantyResponse(m *entities.WarrantyCard) *dto.AdminWarrantyResponse {
	// Khởi tạo DTO với các trường dữ liệu cơ bản chắc chắn không NULL
	res := &dto.AdminWarrantyResponse{
		ID:             m.ID.String(),
		Code:           m.Code,
		CustomerName:   m.CustomerName,
		ProductID:      m.ProductID.String(),
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

	if m.ClinicID != nil {
		res.ClinicID = m.ClinicID.String()
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
	if !ws.codeRegex.MatchString(code) {
		return nil, errs.ErrInvalidCodeFormat
	}
	cacheKey := fmt.Sprint(WarrantyCard + code)
	cachedData, err := ws.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var publicDTO dto.PublicWarrantyLookupResponse
		if json.Unmarshal([]byte(cachedData), &publicDTO) == nil {
			return &publicDTO, nil
		}
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

	publicResponse := ToPublicWarrantyLookupResponse(card, clinicName)
	if jsonData, jsonErr := json.Marshal(publicResponse); jsonErr == nil {
		_ = ws.rdb.Set(ctx, cacheKey, jsonData, 10*time.Minute).Err()
	}
	return publicResponse, nil
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
