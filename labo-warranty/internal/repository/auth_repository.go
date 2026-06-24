package repository

import (
	"context"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
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
	db  *sqlx.DB
	rdb *redis.Client
}

func NewAuthRepository(db *sqlx.DB, rdb *redis.Client) AuthRepository {
	return &authRepository{db: db, rdb: rdb}
}

func (ar *authRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	query := `SELECT id, full_name, email, phone, password_hash, role, status, created_at FROM users WHERE email = $1`
	err := ar.db.GetContext(ctx, &user, query, email)
	return &user, err
}

func (ar *authRepository) SaveRefreshToken(ctx context.Context, userID string, token string, duration time.Duration) error {
	key := "auth:refresh-token:" + userID
	return ar.rdb.Set(ctx, key, token, duration).Err()
}

func (ar *authRepository) DeleteRefreshToken(ctx context.Context, userID string) error {
	key := "auth:refresh_token:" + userID
	return ar.rdb.Del(ctx, key).Err()
}

func (ar *authRepository) IsRefreshTokenValid(ctx context.Context, userID string, token string) (bool, error) {
	key := "auth:refresh_token:" + userID
	savedToken, err := ar.rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return savedToken == token, nil
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
