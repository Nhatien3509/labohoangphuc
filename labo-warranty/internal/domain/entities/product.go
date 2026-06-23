package entities

import (
	"time"

	"github.com/google/uuid"
)

type ProductStatus string

const (
	ProductActive   ProductStatus = "active"
	ProductInactive ProductStatus = "inactive"
)

type Product struct {
	ID             uuid.UUID     `db:"id" json:"id"`
	Code           string        `db:"code" json:"code"` // VENUS, KATANA, EMAX...
	Name           string        `db:"name" json:"name"`
	WarrantyMonths int           `db:"warranty_months" json:"warranty_months"`
	MaterialOrigin *string       `db:"material_origin" json:"material_origin,omitempty"`
	Description    *string       `db:"description" json:"description,omitempty"`
	Status         ProductStatus `db:"status" json:"status"`
	CreatedAt      time.Time     `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time     `db:"updated_at" json:"updated_at"`
}
