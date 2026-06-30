package config

import (
	"log"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	AppEnv             string        `mapstructure:"APP_ENV"`
	ServerPort         int           `mapstructure:"SERVER_PORT"`
	ServerReadTimeout  time.Duration `mapstructure:"SERVER_TIMEOUT_READ"`
	ServerWriteTimeout time.Duration `mapstructure:"SERVER_TIMEOUT_WRITE"`

	//DB config
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     int    `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`
	DBSslMode  string `mapstructure:"DB_SSL_MODE"`

	// JWT Config
	JWTSecret     string        `mapstructure:"JWT_SECRET"`
	JWTAccessTTL  time.Duration `mapstructure:"JWT_ACCESS_TTL"`
	JWTRefreshTTL time.Duration `mapstructure:"JWT_REFRESH_TTL"`
}

var AppConfig *Config

func LoadConfig() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, reading from system environment variables")
	}

	viper.AutomaticEnv()
	// Cho phép nền tảng (Vibe Hosting, Heroku...) tiêm cổng qua biến PORT.
	_ = viper.BindEnv("SERVER_PORT", "SERVER_PORT", "PORT")

	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_TIMEOUT_READ", "15s")
	viper.SetDefault("SERVER_TIMEOUT_WRITE", "15s")

	viper.SetDefault("DB_HOST", "127.0.0.1")
	viper.SetDefault("DB_PORT", 5434)
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "secret")
	viper.SetDefault("DB_NAME", "labo_warranty")
	viper.SetDefault("DB_SSL_MODE", "disable")

	viper.SetDefault("JWT_SECRET", "LaboHanoi_Super_Secret_Key_2026_Do_Not_Use_In_Prod")
	viper.SetDefault("JWT_ACCESS_TTL", "15m")
	viper.SetDefault("JWT_REFRESH_TTL", "168h")

	AppConfig = &Config{
		AppEnv:             viper.GetString("APP_ENV"),
		ServerPort:         viper.GetInt("SERVER_PORT"),
		ServerReadTimeout:  viper.GetDuration("SERVER_TIMEOUT_READ"),
		ServerWriteTimeout: viper.GetDuration("SERVER_TIMEOUT_WRITE"),

		DBHost:     viper.GetString("DB_HOST"),
		DBPort:     viper.GetInt("DB_PORT"),
		DBUser:     viper.GetString("DB_USER"),
		DBPassword: viper.GetString("DB_PASSWORD"),
		DBName:     viper.GetString("DB_NAME"),
		DBSslMode:  viper.GetString("DB_SSL_MODE"),

		JWTSecret:     viper.GetString("JWT_SECRET"),
		JWTAccessTTL:  viper.GetDuration("JWT_ACCESS_TTL"),
		JWTRefreshTTL: viper.GetDuration("JWT_REFRESH_TTL"),
	}
}
