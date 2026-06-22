// Share handler — phân trang dữ liệu bản sao (REPLICA) từ Hive zone2 cho đối tác.
package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"

	"labohoangpuc/sharing-service/internal/client"
	"labohoangpuc/sharing-service/internal/config"
	"labohoangpuc/sharing-service/internal/model"
	"labohoangpuc/sharing-service/internal/repository"
)

var (
	maCauHinhPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)
	columnPattern    = regexp.MustCompile(`^[a-z][a-z0-9_]*(__[a-z0-9_]+)*$`)
)

type ShareHandler struct {
	logRepo repository.AccessLogRepo
	hive    *client.HiveClient
	hue     *client.HueClient
	cfg     *config.Config
}

func NewShareHandler(
	logRepo repository.AccessLogRepo,
	hive *client.HiveClient,
	hue *client.HueClient,
	cfg *config.Config,
) *ShareHandler {
	return &ShareHandler{logRepo: logRepo, hive: hive, hue: hue, cfg: cfg}
}

func (h *ShareHandler) RegisterRoutes(r *gin.Engine) {
	r.POST("/api/sharing/share", h.Share)
}

type shareRequest struct {
	ListFields       []string `json:"list_fields"`
	Domain           string   `json:"domain" binding:"required"`
	SourceSystemCode string   `json:"source_system_code" binding:"required"`
	SourceSystemIP   string   `json:"source_system_ip" binding:"required"`
}

type accessLogParams struct {
	req          *shareRequest
	maCauHinh    string
	hiveTable    string
	page         int
	pageSize     int
	recordCount  int
	httpStatus   int
	errorMessage string
}

// Share — POST /api/sharing/share?ma_cau_hinh=...&page=1&page_size=20
func (h *ShareHandler) Share(c *gin.Context) {
	ctx := c.Request.Context()
	maCauHinh := strings.TrimSpace(c.Query("ma_cau_hinh"))
	page, pageSize := parsePagination(c, h.cfg.DefaultSharePageSize)

	if maCauHinh == "" {
		h.fail(c, ctx, accessLogParams{
			page: page, pageSize: pageSize,
			httpStatus: http.StatusBadRequest,
			errorMessage: "ma_cau_hinh là bắt buộc (query param)",
		})
		return
	}
	if !maCauHinhPattern.MatchString(maCauHinh) {
		h.fail(c, ctx, accessLogParams{
			maCauHinh: maCauHinh, page: page, pageSize: pageSize,
			httpStatus: http.StatusBadRequest,
			errorMessage: "ma_cau_hinh không hợp lệ",
		})
		return
	}

	var req shareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.fail(c, ctx, accessLogParams{
			maCauHinh: maCauHinh, page: page, pageSize: pageSize,
			httpStatus: http.StatusBadRequest,
			errorMessage: "body không hợp lệ: " + err.Error(),
		})
		return
	}

	cols, badFields := resolveListFields(req.ListFields)
	if len(badFields) > 0 {
		msg := "field không hợp lệ: " + strings.Join(badFields, ", ")
		h.fail(c, ctx, accessLogParams{
			req: &req, maCauHinh: maCauHinh, page: page, pageSize: pageSize,
			httpStatus: http.StatusBadRequest, errorMessage: msg,
		})
		return
	}

	if h.hive == nil {
		h.fail(c, ctx, accessLogParams{
			req: &req, maCauHinh: maCauHinh, page: page, pageSize: pageSize,
			httpStatus: http.StatusServiceUnavailable,
			errorMessage: "Hive chưa sẵn sàng — thử lại sau",
		})
		return
	}

	hiveTable := model.Zone2Table(h.cfg.ReplicaZone, maCauHinh)

	var total int64 = -1
	var countErrMsg string
	countCtx, cancel := context.WithTimeout(ctx, 90*time.Second)
	var err error
	total, err = h.hue.Count(countCtx, hiveTable)
	cancel()
	if err != nil {
		countErrMsg = err.Error()
		total = -1
	}

	offset := (page - 1) * pageSize
	listCtx, cancelList := context.WithTimeout(ctx, 90*time.Second)
	defer cancelList()
	rows, err := h.hive.ListRows(listCtx, hiveTable, cols, pageSize, offset)
	if err != nil {
		h.fail(c, ctx, accessLogParams{
			req: &req, maCauHinh: maCauHinh, hiveTable: hiveTable,
			page: page, pageSize: pageSize,
			httpStatus: http.StatusInternalServerError,
			errorMessage: "list failed: " + err.Error(),
		})
		return
	}

	recordCount := len(rows)
	h.writeAccessLog(ctx, accessLogParams{
		req: &req, maCauHinh: maCauHinh, hiveTable: hiveTable,
		page: page, pageSize: pageSize, recordCount: recordCount,
		httpStatus: http.StatusOK,
	})

	totalPages := int64(-1)
	hasMore := false
	if total >= 0 && pageSize > 0 {
		totalPages = (total + int64(pageSize) - 1) / int64(pageSize)
		hasMore = int64(page) < totalPages
	} else {
		hasMore = recordCount >= pageSize
	}

	c.JSON(http.StatusOK, gin.H{
		"ma_cau_hinh": maCauHinh,
		"hive_table":  hiveTable,
		"page":        page,
		"page_size":   pageSize,
		"total":       total,
		"count_error": countErrMsg,
		"total_pages": totalPages,
		"has_more":    hasMore,
		"count":       recordCount,
		"data":        rows,
	})
}

func (h *ShareHandler) fail(c *gin.Context, ctx context.Context, p accessLogParams) {
	h.writeAccessLog(ctx, p)
	c.JSON(p.httpStatus, gin.H{"error": p.errorMessage})
}

func parsePagination(c *gin.Context, defaultPageSize int) (page, pageSize int) {
	pageSize = defaultPageSize
	if s := c.Query("page_size"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 && n <= 1000 {
			pageSize = n
		}
	}
	page = 1
	if s := c.Query("page"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n >= 1 {
			page = n
		}
	}
	return page, pageSize
}

func (h *ShareHandler) writeAccessLog(ctx context.Context, p accessLogParams) {
	if h.logRepo == nil {
		return
	}

	var listFieldsJSON datatypes.JSON
	if p.req != nil && len(p.req.ListFields) > 0 {
		b, err := json.Marshal(p.req.ListFields)
		if err != nil {
			slog.Warn("[SharingLog] marshal list_fields failed", "err", err)
		} else {
			listFieldsJSON = datatypes.JSON(b)
		}
	}

	entry := &model.SharingAccessLog{
		MaCauHinh:    p.maCauHinh,
		HiveTable:    p.hiveTable,
		Page:         p.page,
		PageSize:     p.pageSize,
		HTTPStatus:   p.httpStatus,
		ErrorMessage: p.errorMessage,
		RecordCount:  p.recordCount,
		ListFields:   listFieldsJSON,
	}
	if p.req != nil {
		entry.Domain = strings.TrimSpace(p.req.Domain)
		entry.SourceSystemCode = strings.TrimSpace(p.req.SourceSystemCode)
		entry.SourceSystemIP = strings.TrimSpace(p.req.SourceSystemIP)
	}

	if err := h.logRepo.Create(ctx, entry); err != nil {
		slog.Error("[SharingLog] create failed",
			"ma_cau_hinh", p.maCauHinh,
			"http_status", p.httpStatus,
			"record_count", p.recordCount,
			"err", err)
	}
}

func resolveListFields(listFields []string) (cols, badFields []string) {
	if len(listFields) == 0 {
		return nil, nil
	}
	seen := make(map[string]bool, len(listFields))
	for _, raw := range listFields {
		f := strings.TrimSpace(raw)
		if f == "" || seen[f] {
			continue
		}
		seen[f] = true
		if columnPattern.MatchString(f) {
			cols = append(cols, f)
		} else {
			badFields = append(badFields, f)
		}
	}
	return cols, badFields
}
