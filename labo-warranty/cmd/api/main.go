package main

import (
	"context"
	"fmt"
	"labohoangphuc/labo-warranty/internal/config"
	"labohoangphuc/labo-warranty/internal/http/handler"
	"labohoangphuc/labo-warranty/internal/repository"
	"labohoangphuc/labo-warranty/internal/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	db, err := repository.NewPostgresDB()
	if err != nil {
		log.Fatalf("Lỗi nghiêm trọng hệ thống(không thể kết nối đến Database): %v", err)
	}
	defer db.Close()
	log.Println("-> [PostgreSQL]: Kết nối thông suốt, Pool đã sẵn sàng hoạt động!")

	rdb, err := repository.NewRedisClient()
	if err != nil {
		log.Fatalf("Lỗi nghiêm trọng hệ thống(không thể kết nối đến Redis): %v", err)
	}
	defer db.Close()
	log.Println("-> [Redis]: Kết nối thông suốt, Redis đã sẵn sàng hoạt động!")
	warrantyRepo := repository.NewWarrantyRepository(db)
	warrantyService := service.NewWarrantyService(warrantyRepo, rdb)
	warrantyHandler := handler.NewWarrantyHandler(warrantyService)

	if config.AppConfig.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// Khai báo Base Path: /api/v1 theo đúng Spec tài liệu thiết kế
	v1 := r.Group("/api/v1")
	{
		// Endpoint Tra cứu công khai dành cho Khách vãng lai
		v1.GET("/warranty/:code", warrantyHandler.PublicLookup)

		// Nhóm Endpoint bảo mật dành cho Admin/Staff
		adminGroup := v1.Group("/admin")
		{
			// Sau này bạn cắm Middleware Auth JWT vào đây: adminGroup.Use(middleware.Auth())
			adminGroup.POST("/warranty-cards", warrantyHandler.CreateCard)
		}
	}

	serverAddr := fmt.Sprintf(":%d", config.AppConfig.ServerPort)
	srv := &http.Server{
		Addr:    serverAddr,
		Handler: r,
	}

	// Chạy Server trong một Goroutine riêng biệt để không chặn tiến trình chính
	go func() {
		log.Printf("-> [Gin Server]: 🚀 Đang lắng nghe yêu cầu tại cổng %s...", serverAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Lỗi sập Server: %v", err)
		}
	}()

	// Lắng nghe tín hiệu tắt máy từ Hệ điều hành (Bấm Ctrl+C hoặc lệnh Kill)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("-> [System]: Đang tiến hành đóng hệ thống an toàn...")

	// Cấp cho Server tối đa 5 giây để hoàn tất nốt các Request đang xử lý dở dang
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server buộc phải dừng đột ngột: %v", err)
	}

	log.Println("=== Hệ thống đã dừng an toàn hoàn toàn. Tạm biệt! ===")

}
