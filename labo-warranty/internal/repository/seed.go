package repository

import (
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// SeedAdmin tạo tài khoản admin nếu email chưa tồn tại (idempotent, không ghi đè).
// Dùng cho production: set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD ở môi trường,
// backend tự tạo admin lần khởi động đầu. Trả về true nếu vừa tạo mới.
func SeedAdmin(db *sqlx.DB, email, password, fullName string) (bool, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return false, err
	}
	if fullName == "" {
		fullName = "Administrator"
	}
	res, err := db.Exec(`
		INSERT INTO users (full_name, email, password_hash, role, status)
		VALUES ($1, $2, $3, 'admin', 'active')
		ON CONFLICT (email) DO NOTHING`, fullName, email, string(hash))
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
