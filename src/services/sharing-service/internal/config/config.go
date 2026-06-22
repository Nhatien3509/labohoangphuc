package config

import (
	"log/slog"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string

	DBHost string
	DBPort string
	DBUser string
	DBPass string
	DBName string

	HiveHost string
	HivePort int
	HiveUser string
	HivePass string

	HueURL  string
	HueUser string
	HuePass string

	ReplicaZone          string
	DefaultSharePageSize int
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, relying on environment variables")
	}
	return &Config{
		AppPort: getEnv("APP_PORT", "8080"),

		DBHost: getEnv("DB_HOST", "localhost"),
		DBPort: getEnv("DB_PORT", "5432"),
		DBUser: getEnv("DB_USER", "postgres"),
		DBPass: getEnv("DB_PASS", ""),
		DBName: getEnv("DB_NAME", "DMST_Warehouse_DB"),

		HiveHost: getEnv("HIVE_HOST", "160.191.32.149"),
		HivePort: getEnvInt("HIVE_PORT", 10000),
		HiveUser: getEnv("HIVE_USER", "admin"),
		HivePass: getEnv("HIVE_PASS", "Abcd@123456"),

		HueURL:  getEnv("HUE_URL", "http://160.191.32.149:8889"),
		HueUser: getEnv("HUE_USER", "admin"),
		HuePass: getEnv("HUE_PASS", "Abcd@123456"),

		ReplicaZone:          getEnv("REPLICA_ZONE", "zone2"),
		DefaultSharePageSize: getEnvInt("DEFAULT_SHARE_PAGE_SIZE", 20),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return i
}
