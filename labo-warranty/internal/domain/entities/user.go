package entities

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string
type UserStatus string

const (
	RoleAdmin    UserRole = "admin"
	RoleStaff    UserRole = "staff"
	RoleCustomer UserRole = "customer"

	UserStatusActive   UserStatus = "active"
	UserStatusDisabled UserStatus = "disabled"
)

type User struct {
	UUID         uuid.UUID  `db:"uuid" json:"uuid"`
	ID           string     `db:"id" json:"id"`
	FullName     string     `db:"full_name" json:"full_name"`
	Email        string     `db:"email" json:"email"`
	Phone        *string    `db:"phone" json:"phone,omitempty"`
	PasswordHash string     `db:"password_hash" json:"-"` // Không bao giờ trả về password hash trong JSON
	Role         UserRole   `db:"role" json:"role"`
	Status       UserStatus `db:"status" json:"status"`
	LastLoginAt  *time.Time `db:"last_login_at" json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
}
