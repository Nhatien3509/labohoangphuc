package repository

import (
	"context"
	"database/sql"
	"errors"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	"time"

	"github.com/jmoiron/sqlx"
)

type AuthRepository interface {
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	SaveRefreshToken(ctx context.Context, userID string, token string, duration time.Duration) error
	DeleteRefreshToken(ctx context.Context, userID string) error
	IsRefreshTokenValid(ctx context.Context, userID string, token string) (bool, error)
	UpdatePassword(ctx context.Context, userID string, newHash string) error
	FindByID(ctx context.Context, id string) (*entities.User, error)
}

type authRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) AuthRepository {
	return &authRepository{db: db}
}

func (ar *authRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	query := `SELECT id, full_name, email, phone, password_hash, role, status, created_at FROM users WHERE email = $1`
	err := ar.db.GetContext(ctx, &user, query, email)
	return &user, err
}

// SaveRefreshToken lưu (hoặc thay thế) refresh token của user kèm thời hạn.
// Mỗi user chỉ giữ một refresh token (token rotation) -> UPSERT theo user_id.
func (ar *authRepository) SaveRefreshToken(ctx context.Context, userID string, token string, duration time.Duration) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at, updated_at)
		VALUES ($1::uuid, $2, $3, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id) DO UPDATE
			SET token = EXCLUDED.token,
			    expires_at = EXCLUDED.expires_at,
			    updated_at = CURRENT_TIMESTAMP`
	_, err := ar.db.ExecContext(ctx, query, userID, token, time.Now().Add(duration))
	return err
}

func (ar *authRepository) DeleteRefreshToken(ctx context.Context, userID string) error {
	_, err := ar.db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE user_id = $1::uuid`, userID)
	return err
}

// IsRefreshTokenValid kiểm tra token có khớp bản đang lưu và còn hạn không.
func (ar *authRepository) IsRefreshTokenValid(ctx context.Context, userID string, token string) (bool, error) {
	var saved struct {
		Token     string    `db:"token"`
		ExpiresAt time.Time `db:"expires_at"`
	}
	query := `SELECT token, expires_at FROM refresh_tokens WHERE user_id = $1::uuid`
	if err := ar.db.GetContext(ctx, &saved, query, userID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	if time.Now().After(saved.ExpiresAt) {
		return false, nil
	}
	return saved.Token == token, nil
}

func (ar *authRepository) UpdatePassword(ctx context.Context, userID string, newHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE id = $2`
	_, err := ar.db.ExecContext(ctx, query, newHash, userID)
	return err
}

func (ar *authRepository) FindByID(ctx context.Context, id string) (*entities.User, error) {
	var user entities.User
	query := `SELECT id, password_hash, status FROM users WHERE id = $1::uuid`
	err := ar.db.GetContext(ctx, &user, query, id)
	return &user, err
}
