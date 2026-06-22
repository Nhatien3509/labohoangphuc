package main

import (
	"log"

	"labohoangpuc/audit-service/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	log.Printf("starting audit-service on :%s", cfg.Port)
}
