package main

import (
	"log"

	"labohoangpuc/mock_datasource/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	log.Printf("starting mock_datasource (gen) on :%s", cfg.Port)
}
