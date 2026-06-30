package main

import (
	"context"
	"fmt"
	"labohoangphuc/labo-warranty/internal/config"
	"labohoangphuc/labo-warranty/internal/http/handler"
	"labohoangphuc/labo-warranty/internal/http/middleware"
	"labohoangphuc/labo-warranty/internal/repository"
	"labohoangphuc/labo-warranty/internal/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func main() {
	config.LoadConfig()
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		_ = v.RegisterValidation("secure_password", middleware.ValidateSecurePassword)
	}
	jwtSecret := config.AppConfig.JWTSecret
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
	defer rdb.Close()
	log.Println("-> [Redis]: Kết nối thông suốt, Redis đã sẵn sàng hoạt động!")
	warrantyRepo := repository.NewWarrantyRepository(db)
	warrantyService := service.NewWarrantyService(warrantyRepo, rdb)
	warrantyHandler := handler.NewWarrantyHandler(warrantyService)

	authRepository := repository.NewAuthRepository(db, rdb)
	authService := service.NewAuthService(authRepository, jwtSecret)
	authHandler := handler.NewAuthHandler(authService)
	if config.AppConfig.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// Khai báo Base Path: /api/v1
	v1 := r.Group("/api/v1")
	{
		// 🔓 1. Nhóm Auth Public hoàn toàn (Không bọc bất kỳ Middleware nào)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
		}

		// 🔒 2. Nhóm Auth Bảo mật (Chỉ áp dụng riêng cho Logout và Change Password)
		// Đổi toàn bộ thành chữ w thường để khớp với file middleware chuẩn
		authProtected := v1.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware([]byte(jwtSecret)))
		{
			authProtected.POST("/logout", authHandler.Logout)
			authProtected.POST("/change-password", authHandler.ChangePassword)
		}

		// Endpoint Tra cứu công khai dành cho Khách vãng lai
		v1.GET("/warranty/:code", warrantyHandler.PublicLookup)

		// Nhóm Endpoint bảo mật dành cho Admin/Staff
		adminGroup := v1.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware([]byte(jwtSecret)))
		{
			adminGroup.GET("/warranty-cards", warrantyHandler.ListCards)
			adminGroup.GET("/check-warranty-code", warrantyHandler.CheckCode)
			adminGroup.GET("/warranty-cards/:id", warrantyHandler.GetCard)
			adminGroup.POST("/warranty-cards", warrantyHandler.CreateCard)
			adminGroup.PUT("/warranty-cards/:id", warrantyHandler.UpdateCard)
			adminGroup.DELETE("/warranty-cards/:id", warrantyHandler.DeleteCard)
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
