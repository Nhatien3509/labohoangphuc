package handler

import (
	"errors"
	"labohoangphuc/labo-warranty/internal/domain/dto"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"
	"labohoangphuc/labo-warranty/internal/service"
	"net/http"

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
