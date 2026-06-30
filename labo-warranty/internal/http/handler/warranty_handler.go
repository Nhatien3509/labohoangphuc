package handler

import (
	"errors"
	"labohoangphuc/labo-warranty/internal/domain/dto"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WarrantyHandler struct {
	ws service.WarrantyService
}

func NewWarrantyHandler(ws service.WarrantyService) *WarrantyHandler {
	return &WarrantyHandler{
		ws: ws,
	}
}

func (wh *WarrantyHandler) PublicLookup(c *gin.Context) {
	code := c.Param("code")
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	res, err := wh.ws.PublicLookup(c, code, ipAddress, userAgent)
	if err != nil {
		if errors.Is(err, errs.ErrInvalidCodeFormat) {
			c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("INVALID_CODE_FORMAT"))
			return
		}

		if errors.Is(err, errs.ErrCardNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("WARRANTY_NOT_FOUND"))
			return
		}

		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (wh *WarrantyHandler) ListCards(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	res, err := wh.ws.ListCards(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (wh *WarrantyHandler) CheckCode(c *gin.Context) {
	code := c.Query("code")
	exists, err := wh.ws.CodeExists(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(dto.CodeCheckResponse{Exists: exists}))
}

func (wh *WarrantyHandler) GetCard(c *gin.Context) {
	id := c.Param("id")
	res, err := wh.ws.GetCard(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrCardNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("WARRANTY_NOT_FOUND"))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (wh *WarrantyHandler) UpdateCard(c *gin.Context) {
	id := c.Param("id")
	var req dto.AdminUpdateWarrantyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("BAD_REQUEST: "+err.Error()))
		return
	}

	res, err := wh.ws.UpdateCard(c.Request.Context(), id, &req)
	if err != nil {
		if errors.Is(err, errs.ErrCardNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("WARRANTY_NOT_FOUND"))
			return
		}
		if errors.Is(err, errs.ErrDuplicateCardCode) {
			c.JSON(http.StatusConflict, dto.NewErrorResponse("CODE_DUPLICATED"))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse(res))
}

func (wh *WarrantyHandler) DeleteCard(c *gin.Context) {
	id := c.Param("id")
	if err := wh.ws.DeleteCard(c.Request.Context(), id); err != nil {
		if errors.Is(err, errs.ErrCardNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("WARRANTY_NOT_FOUND"))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusOK, dto.NewSuccessResponse("Đã xoá thẻ bảo hành"))
}

func (wh *WarrantyHandler) CreateCard(c *gin.Context) {
	var request dto.AdminCreateWarrantyRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("BAD_REQUEST: "+err.Error()))
		return
	}
	adminIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, errs.ErrMissingUser)
		return
	}
	adminID, ok := adminIDVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, errs.ErrInvalidUser)
		return
	}

	res, err := wh.ws.CreateCard(c.Request.Context(), &request, adminID)
	if err != nil {
		if errors.Is(err, errs.ErrDuplicateCardCode) {
			c.JSON(http.StatusConflict, dto.NewErrorResponse("CODE_DUPLICATED"))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("INTERNAL_SERVER_ERROR"))
		return
	}
	c.JSON(http.StatusCreated, dto.NewSuccessResponse(res))
}
