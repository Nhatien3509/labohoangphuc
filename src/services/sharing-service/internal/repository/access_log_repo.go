package repository

import (
	"context"
	"time"

	"labohoangpuc/sharing-service/internal/model"

	"gorm.io/gorm"
)

type AccessLogSummary struct {
	TotalRecords   int64
	DataTypeCount  int64
	DataTypeLabels []string
}

type LatestFlowItem struct {
	MaCauHinh        string
	Domain           string
	SourceSystemCode string
	TotalRecords     int64
	LatestAt         time.Time
}

type FlowRankingItem struct {
	MaCauHinh        string
	Domain           string
	SourceSystemCode string
	TotalRecords     int64
}

type AccessLogRepo interface {
	Create(ctx context.Context, log *model.SharingAccessLog) error
	GetSummary(ctx context.Context, from, to time.Time) (*AccessLogSummary, error)
	GetLatestFlows(ctx context.Context, limit int) ([]LatestFlowItem, error)
	GetFlowRanking(ctx context.Context, from, to time.Time, limit int) ([]FlowRankingItem, error)
}

type postgresAccessLogRepo struct {
	db *gorm.DB
}

func NewAccessLogRepo(db *gorm.DB) AccessLogRepo {
	return &postgresAccessLogRepo{db: db}
}

func (r *postgresAccessLogRepo) Create(ctx context.Context, log *model.SharingAccessLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *postgresAccessLogRepo) GetSummary(ctx context.Context, from, to time.Time) (*AccessLogSummary, error) {
	var agg struct {
		TotalRecords  int64
		DataTypeCount int64
	}
	err := r.db.WithContext(ctx).
		Model(&model.SharingAccessLog{}).
		Select("COALESCE(SUM(record_count), 0) AS total_records, COUNT(DISTINCT ma_cau_hinh) AS data_type_count").
		Where("created_at >= ? AND created_at < ?", from, to).
		Scan(&agg).Error
	if err != nil {
		return nil, err
	}

	var labels []string
	err = r.db.WithContext(ctx).
		Model(&model.SharingAccessLog{}).
		Select("ma_cau_hinh").
		Where("created_at >= ? AND created_at < ?", from, to).
		Group("ma_cau_hinh").
		Order("SUM(record_count) DESC").
		Limit(3).
		Pluck("ma_cau_hinh", &labels).Error
	if err != nil {
		return nil, err
	}
	if labels == nil {
		labels = []string{}
	}

	return &AccessLogSummary{
		TotalRecords:   agg.TotalRecords,
		DataTypeCount:  agg.DataTypeCount,
		DataTypeLabels: labels,
	}, nil
}

func (r *postgresAccessLogRepo) GetLatestFlows(ctx context.Context, limit int) ([]LatestFlowItem, error) {
	var rows []struct {
		MaCauHinh        string    `gorm:"column:ma_cau_hinh"`
		Domain           string    `gorm:"column:domain"`
		SourceSystemCode string    `gorm:"column:source_system_code"`
		TotalRecords     int64     `gorm:"column:total_records"`
		LatestAt         time.Time `gorm:"column:latest_at"`
	}
	err := r.db.WithContext(ctx).
		Model(&model.SharingAccessLog{}).
		Select("ma_cau_hinh, domain, source_system_code, SUM(record_count) AS total_records, MAX(created_at) AS latest_at").
		Group("ma_cau_hinh, domain, source_system_code").
		Order("latest_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]LatestFlowItem, len(rows))
	for i, r := range rows {
		result[i] = LatestFlowItem{
			MaCauHinh:        r.MaCauHinh,
			Domain:           r.Domain,
			SourceSystemCode: r.SourceSystemCode,
			TotalRecords:     r.TotalRecords,
			LatestAt:         r.LatestAt,
		}
	}
	return result, nil
}

func (r *postgresAccessLogRepo) GetFlowRanking(ctx context.Context, from, to time.Time, limit int) ([]FlowRankingItem, error) {
	var rows []struct {
		MaCauHinh        string `gorm:"column:ma_cau_hinh"`
		Domain           string `gorm:"column:domain"`
		SourceSystemCode string `gorm:"column:source_system_code"`
		TotalRecords     int64  `gorm:"column:total_records"`
	}
	err := r.db.WithContext(ctx).
		Model(&model.SharingAccessLog{}).
		Select("ma_cau_hinh, domain, source_system_code, SUM(record_count) AS total_records").
		Where("created_at >= ? AND created_at < ?", from, to).
		Group("ma_cau_hinh, domain, source_system_code").
		Order("total_records DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]FlowRankingItem, len(rows))
	for i, r := range rows {
		result[i] = FlowRankingItem{
			MaCauHinh:        r.MaCauHinh,
			Domain:           r.Domain,
			SourceSystemCode: r.SourceSystemCode,
			TotalRecords:     r.TotalRecords,
		}
	}
	return result, nil
}
