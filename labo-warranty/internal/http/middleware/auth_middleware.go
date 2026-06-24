package middleware

import (
	"labohoangphuc/labo-warranty/internal/domain/dto"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, errs.ErrResponse)
			c.Abort()
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, errs.ErrInvalidCodeFormat)
			c.Abort()
			return
		}
		tokenString := parts[1]
		claims := &dto.AppClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, errs.ErrUnauthorized)
			c.Abort()
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func ValidateSecurePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	// 1. Kiểm tra độ dài tối thiểu là 8
	if len(password) < 8 {
		return false
	}

	// 2. Định nghĩa các quy tắc Regex bảo mật
	var (
		hasUpper   = regexp.MustCompile(`[A-Z]`).MatchString(password)
		hasLower   = regexp.MustCompile(`[a-z]`).MatchString(password)
		hasNumber  = regexp.MustCompile(`[0-9]`).MatchString(password)
		hasSpecial = regexp.MustCompile(`[!@#\$%\^&\*_\+\-\[\]\{\};: ,.\?]`).MatchString(password)
	)

	// Mật khẩu phải thỏa mãn đồng thời tất cả các điều kiện trên
	return hasUpper && hasLower && hasNumber && hasSpecial
}
