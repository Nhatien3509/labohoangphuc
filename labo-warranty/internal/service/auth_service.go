package service

import (
	"context"
	"errors"
	"fmt"
	"labohoangphuc/labo-warranty/internal/domain/dto"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.TokenResponse, error)
	Logout(ctx context.Context, userID string) error
	ChangePassWord(ctx context.Context, userID string, req *dto.ChangPassWord) error
}

type authService struct {
	ar        repository.AuthRepository
	jwtSecret []byte
}

func NewAuthService(ar repository.AuthRepository, secret string) AuthService {
	return &authService{ar: ar, jwtSecret: []byte(secret)}
}

func (as *authService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.TokenResponse, error) {
	email := req.Email
	user, err := as.ar.FindByEmail(ctx, email)
	if err != nil {
		return nil, errs.ErrUserNotFound
	}

	if user.Status == entities.UserStatusDisabled {
		return nil, errs.ErrDisable
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, errs.ErrInvalidPassword
	}

	accessToken, err := as.generateToken(user.ID, user.Role, 15*time.Minute)
	if err != nil {
		return nil, errors.New("lỗi hệ thống khi khởi tạo mã xác thực")
	}
	refreshToken, err := as.generateToken(user.ID, user.Role, 7*24*time.Hour)
	if err != nil {
		return nil, errors.New("lỗi hệ thống khi khởi tạo mã xác thực")
	}

	err = as.ar.SaveRefreshToken(ctx, user.ID, refreshToken, 7*24*time.Hour)
	if err != nil {
		return nil, errors.New("không thể khởi tạo phiên đăng nhập")
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (as *authService) generateToken(userId string, role entities.UserRole, duration time.Duration) (string, error) {
	now := time.Now()
	claims := dto.AppClaims{
		UserID: userId,
		Role:   string(role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(duration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(as.jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (as *authService) Logout(ctx context.Context, userID string) error {
	return as.ar.DeleteRefreshToken(ctx, userID)
}

func (as *authService) ChangePassWord(ctx context.Context, userID string, req *dto.ChangPassWord) error {
	user, err := as.ar.FindByID(ctx, userID)
	if err != nil {
		return errs.ErrUserNotFound
	}

	if user.Status == entities.UserStatusDisabled {
		return errs.ErrDisable
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassWord))
	if err != nil {
		return errs.ErrInvalidPassword
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassWord), bcrypt.DefaultCost)
	if err != nil {
		return errs.ErrHashPassWord
	}
	err = as.ar.UpdatePassword(ctx, userID, string(newHash))
	if err != nil {
		fmt.Println(err)
		return errs.ErrUpdatePassWord
	}
	return nil
}
