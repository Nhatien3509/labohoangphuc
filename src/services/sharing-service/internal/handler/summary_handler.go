package handler

import (
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"labohoangpuc/sharing-service/internal/repository"
)

type SummaryHandler struct {
	repo repository.AccessLogRepo
}

func NewSummaryHandler(repo repository.AccessLogRepo) *SummaryHandler {
	return &SummaryHandler{repo: repo}
}

type sharingSummaryResponse struct {
	TotalRecords    int64    `json:"total_records"`
	AvgPerDay       float64  `json:"avg_per_day"`
	DataTypeCount   int64    `json:"data_type_count"`
	DataTypeLabels  []string `json:"data_type_labels"`
	TotalRecordsPct float64  `json:"total_records_pct"`
	AvgPerDayPct    float64  `json:"avg_per_day_pct"`
}

func periodToDays(period string) int {
	switch period {
	case "month":
		return 30
	case "quarter":
		return 90
	default:
		return 7
	}
}

func pctChange(curr, prev int64) float64 {
	if prev == 0 {
		return 0
	}
	raw := float64(curr-prev) / float64(prev) * 100
	return math.Round(raw*10) / 10
}

type latestFlowResponse struct {
	FlowCode         string    `json:"flow_code"`
	Domain           string    `json:"domain"`
	SourceSystemCode string    `json:"source_system_code"`
	RecordCount      int64     `json:"record_count"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type flowRankingResponse struct {
	Rank             int    `json:"rank"`
	FlowCode         string `json:"flow_code"`
	Domain           string `json:"domain"`
	SourceSystemCode string `json:"source_system_code"`
	RecordCount      int64  `json:"record_count"`
	MaxRecords       int64  `json:"max_records"`
}

func (h *SummaryHandler) GetLatestFlows(c *gin.Context) {
	limit := 5
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	rows, err := h.repo.GetLatestFlows(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	result := make([]latestFlowResponse, len(rows))
	for i, r := range rows {
		result[i] = latestFlowResponse{
			FlowCode:         strings.ToUpper(r.MaCauHinh),
			Domain:           r.Domain,
			SourceSystemCode: r.SourceSystemCode,
			RecordCount:      r.TotalRecords,
			UpdatedAt:        r.LatestAt,
		}
	}
	c.JSON(http.StatusOK, result)
}

func (h *SummaryHandler) GetFlowRanking(c *gin.Context) {
	period := c.DefaultQuery("period", "week")
	limit := 5
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	days := periodToDays(period)
	now := time.Now()
	from := now.AddDate(0, 0, -days)

	rows, err := h.repo.GetFlowRanking(c.Request.Context(), from, now, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var maxRecords int64
	if len(rows) > 0 {
		maxRecords = rows[0].TotalRecords
	}
	result := make([]flowRankingResponse, len(rows))
	for i, r := range rows {
		result[i] = flowRankingResponse{
			Rank:             i + 1,
			FlowCode:         strings.ToUpper(r.MaCauHinh),
			Domain:           r.Domain,
			SourceSystemCode: r.SourceSystemCode,
			RecordCount:      r.TotalRecords,
			MaxRecords:       maxRecords,
		}
	}
	c.JSON(http.StatusOK, result)
}

func (h *SummaryHandler) GetSummary(c *gin.Context) {
	period := c.DefaultQuery("period", "week")
	days := periodToDays(period)

	now := time.Now()
	currFrom := now.AddDate(0, 0, -days)
	prevFrom := now.AddDate(0, 0, -2*days)

	curr, err := h.repo.GetSummary(c.Request.Context(), currFrom, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	prev, err := h.repo.GetSummary(c.Request.Context(), prevFrom, currFrom)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	currAvg := float64(curr.TotalRecords) / float64(days)
	prevAvgInt := prev.TotalRecords / int64(days)

	c.JSON(http.StatusOK, sharingSummaryResponse{
		TotalRecords:    curr.TotalRecords,
		AvgPerDay:       math.Round(currAvg*10) / 10,
		DataTypeCount:   curr.DataTypeCount,
		DataTypeLabels:  curr.DataTypeLabels,
		TotalRecordsPct: pctChange(curr.TotalRecords, prev.TotalRecords),
		AvgPerDayPct:    pctChange(int64(math.Round(currAvg)), prevAvgInt),
	})
}
