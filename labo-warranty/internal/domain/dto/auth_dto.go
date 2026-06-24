package dto

import (
	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
type AppClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type ChangPassWord struct {
	OldPassWord string `json:"old_password" binding:"required,min=6"`
	NewPassWord string `json:"new_password" binding:"required,secure_password"`
}
type ResetPasswordRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,secure_password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}
