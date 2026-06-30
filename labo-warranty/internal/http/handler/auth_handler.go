package handler

import (
	"labohoangphuc/labo-warranty/internal/domain/dto"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	as service.AuthService
}

func NewAuthHandler(as service.AuthService) *AuthHandler {
	return &AuthHandler{as: as}
}

func (ah *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(errs.ErrInvalidInput.Error()))
		return
	}

	res, err := ah.as.Login(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case errs.ErrUserNotFound:
			c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Tài khoản email không tồn tại trên hệ thống"))
		case errs.ErrInvalidPassword:
			c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Mật khẩu đăng nhập không chính xác"))
		case errs.ErrDisable:
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Tài khoản của bạn hiện đang bị khóa"))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Lỗi xử lý nội bộ hệ thống"))
		}
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (ah *AuthHandler) Refresh(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(errs.ErrInvalidInput.Error()))
		return
	}

	res, err := ah.as.Refresh(c.Request.Context(), req.RefreshToken)
	if err != nil {
		if err == errs.ErrInvalidRefreshToken {
			c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Lỗi xử lý nội bộ hệ thống"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (ah *AuthHandler) Logout(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(errs.ErrSessionNotFound.Error()))
		return
	}

	userID, ok := userIDVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(errs.ErrInvalidCodeFormat.Error()))
		return
	}

	err := ah.as.Logout(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(errs.ErrLogout.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Đăng xuất thành công"))
}

func (ah *AuthHandler) ChangePassword(c *gin.Context) {
	var req dto.ChangPassWord
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(errs.ErrValidate.Error()))
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(errs.ErrSessionNotFound.Error()))
		return
	}

	userID, ok := userIDVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(errs.ErrInvalidCodeFormat.Error()))
		return
	}

	err := ah.as.ChangePassWord(c.Request.Context(), userID, &req)
	if err != nil {
		switch err {
		case errs.ErrUserNotFound:
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Người dùng không tồn tại trên hệ thống"))
		case errs.ErrInvalidPassword:
			c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Mật khẩu cũ nhập vào không chính xác"))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Không thể cập nhật mật khẩu lúc này"))
		}
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse("Đổi mật khẩu thành công."))
}
