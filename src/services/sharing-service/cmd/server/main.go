package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"labohoangpuc/sharing-service/internal/client"
	sharingconfig "labohoangpuc/sharing-service/internal/config"
	"labohoangpuc/sharing-service/internal/handler"
	"labohoangpuc/sharing-service/internal/model"
	"labohoangpuc/sharing-service/internal/repository"
)

func main() {
	cfg := sharingconfig.LoadConfig()

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBPort,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect postgres: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	defer sqlDB.Close()
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err := db.AutoMigrate(&model.SharingAccessLog{}); err != nil {
		log.Fatalf("migrate sharing_access_logs: %v", err)
	}
	log.Printf("connected postgres %s@%s:%s", cfg.DBName, cfg.DBHost, cfg.DBPort)

	hiveClient := client.NewHiveClient(cfg.HiveHost, cfg.HivePort, cfg.HiveUser, cfg.HivePass)
	defer hiveClient.Close()

	hueClient := client.NewHueClient(cfg.HueURL, cfg.HueUser, cfg.HuePass)

	logRepo := repository.NewAccessLogRepo(db)
	shareHandler := handler.NewShareHandler(logRepo, hiveClient, hueClient, cfg)
	summaryHandler := handler.NewSummaryHandler(logRepo)

	r := gin.Default()
	handler.RegisterHealth(r)
	shareHandler.RegisterRoutes(r)
	r.GET("/internal/sharing/summary", summaryHandler.GetSummary)
	r.GET("/internal/sharing/latest-flows", summaryHandler.GetLatestFlows)
	r.GET("/internal/sharing/flow-ranking", summaryHandler.GetFlowRanking)

	port := ":" + cfg.AppPort
	log.Printf("sharing-service listening on %s (replica zone=%s)", port, cfg.ReplicaZone)
	if err := r.Run(port); err != nil {
		log.Fatalf("gin run: %v", err)
	}
}
