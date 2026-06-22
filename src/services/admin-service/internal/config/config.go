package config

import "os"

// Config chứa cấu hình hạ tầng cơ bản cho service (skeleton).
type Config struct {
	Port   string
	DBHost string
	DBPort string
	DBName string
	DBUser string
	DBPass string
}

// Load đọc cấu hình từ biến môi trường, có giá trị mặc định.
func Load() (*Config, error) {
	return &Config{
		Port:   getEnv("PORT", "8080"),
		DBHost: getEnv("DB_HOST", "localhost"),
		DBPort: getEnv("DB_PORT", "5432"),
		DBName: getEnv("DB_NAME", "labohoangpuc_db"),
		DBUser: getEnv("DB_USER", "labohoangpuc"),
		DBPass: getEnv("DB_PASS", ""),
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
