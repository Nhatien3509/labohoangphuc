package entities

import (
	"time"

	"github.com/google/uuid"
)

type WarrantyLookup struct {
	ID           uuid.UUID     `db:"id" json:"id"`
	Code         string        `db:"code" json:"code"`
	Found        bool          `db:"found" json:"found"`
	IPAddress    *string       `db:"ip_address" json:"ip_address,omitempty"`
	UserAgent    *string       `db:"user_agent" json:"user_agent,omitempty"`
	LookedUpAt   time.Time     `db:"looked_up_at" json:"looked_up_at"`
	WarrantyCard *WarrantyCard `db:"-" json:"warranty_card,omitempty"`
}
