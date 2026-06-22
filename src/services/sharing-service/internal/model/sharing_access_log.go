package model

import (
	"time"

	"gorm.io/datatypes"
)

// SharingAccessLog — log mỗi lần gọi share API (thành công hoặc lỗi).
// Bảng do sharing-service làm chủ schema; AutoMigrate lúc phát triển.
type SharingAccessLog struct {
	ID uint `gorm:"primaryKey" json:"id"`

	MaCauHinh        string         `gorm:"column:ma_cau_hinh;size:200;index" json:"ma_cau_hinh"`
	Domain           string         `gorm:"column:domain;size:100" json:"domain"`
	SourceSystemCode string         `gorm:"column:source_system_code;size:100" json:"source_system_code"`
	SourceSystemIP   string         `gorm:"column:source_system_ip;size:45" json:"source_system_ip"`
	ListFields       datatypes.JSON `gorm:"column:list_fields;type:jsonb" json:"list_fields,omitempty"`

	HiveTable  string `gorm:"column:hive_table;size:300" json:"hive_table"`
	Page       int    `gorm:"column:page" json:"page"`
	PageSize   int    `gorm:"column:page_size" json:"page_size"`
	HTTPStatus int    `gorm:"column:http_status;not null;index" json:"http_status"`
	// ErrorMessage — nội dung trường "error" trả về client khi request lỗi; rỗng nếu thành công.
	ErrorMessage string `gorm:"column:error_message;type:text" json:"error_message,omitempty"`
	RecordCount  int    `gorm:"column:record_count;not null;default:0" json:"record_count"`

	CreatedAt time.Time `gorm:"index" json:"created_at"`
}

func (SharingAccessLog) TableName() string {
	return "sharing_access_logs"
}

// Zone2Table build full table name: {zone}.{ma_cau_hinh}.
// ma_cau_hinh đã gồm prefix "th_" (vd th_TTDLQG_G02_G02_001) — không ghép thêm.
func Zone2Table(zone, maCauHinh string) string {
	return zone + "." + maCauHinh
}
