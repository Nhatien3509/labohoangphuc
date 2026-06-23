package repository

import (
	"context"
	"fmt"
	"labohoangphuc/labo-warranty/internal/config"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() (*redis.Client, error) {
	addr := fmt.Sprintf("%s:%d", config.AppConfig.RedisHost, config.AppConfig.RedisPort)

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: config.AppConfig.RedisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("không thể kết nối tới Redis tại %s: %w", addr, err)
	}
	return rdb, nil
}
