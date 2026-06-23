package entities

import (
	"time"

	"github.com/google/uuid"
)

type ClinicStatus string

const (
	ClinicActive   ClinicStatus = "active"
	ClinicInactive ClinicStatus = "inactive"
)

type Clinic struct {
	ID            uuid.UUID    `db:"id" json:"id"`
	Name          string       `db:"name" json:"name"`
	Address       *string      `db:"address" json:"address,omitempty"`
	Province      *string      `db:"province" json:"province,omitempty"`
	Phone         *string      `db:"phone" json:"phone,omitempty"`
	ContactPerson *string      `db:"contact_person" json:"contact_person,omitempty"`
	Status        ClinicStatus `db:"status" json:"status"`
	CreatedAt     time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time    `db:"updated_at" json:"updated_at"`
}
