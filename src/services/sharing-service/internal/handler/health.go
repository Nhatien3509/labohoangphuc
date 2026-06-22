package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterHealth(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}
