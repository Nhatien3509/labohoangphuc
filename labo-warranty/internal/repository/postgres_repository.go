package repository

import (
	"context"
	"fmt"
	"labohoangphuc/labo-warranty/internal/config"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // Đăng ký driver pgx hiện đại cho sqlx
	"github.com/jmoiron/sqlx"
)

// initSchema tự động khởi tạo toàn bộ các bảng theo đúng sơ đồ ERD thiết kế.
// Schema này là nguồn chuẩn (khớp 1-1 với các struct trong package entities).
// Các khối ALTER ... ADD COLUMN IF NOT EXISTS bên dưới giúp vá những DB cũ đã
// lỡ tạo bảng thiếu cột, để chạy được mà không cần script migration bên ngoài.
const initSchema = `
-- Kích hoạt các extension cần thiết cho UUID và Email không phân biệt hoa thường
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- Là UNIQUE để làm đích đến cho khóa ngoại
    name TEXT NOT NULL,
    warranty_months INT NOT NULL,
    material_origin TEXT,
    description TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng clinics
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    province TEXT,
    phone TEXT,
    contact_person TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tạo bảng testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    clinic_name TEXT,
    content TEXT NOT NULL,
    rating INT NOT NULL,
    status TEXT NOT NULL
);

-- 5. Tạo bảng warranty_cards
CREATE TABLE IF NOT EXISTS warranty_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- 🌟 BẮT BUỘC PHẢI UNIQUE để bảng lookups nối vào được
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    clinic_name TEXT, -- Tên nha khoa nhập tự do (thay cho số điện thoại trên form phát hành)
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    lab_name TEXT,
    quantity INT NOT NULL DEFAULT 1,
    tooth_positions INT[],
    warranty_months INT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tạo bảng warranty_lookups
CREATE TABLE IF NOT EXISTS warranty_lookups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 🌟 SỬA TẠI ĐÂY: Thêm ràng buộc REFERENCES đến cột code của bảng warranty_cards
    -- ON DELETE CASCADE: Nếu xóa thẻ, lịch sử tra cứu của thẻ đó cũng tự động xóa theo
    code TEXT NOT NULL REFERENCES warranty_cards(code) ON DELETE CASCADE,
    found BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT, -- 🌟 BỔ SUNG: Cho khớp với trường UserAgent bạn vừa thêm trong Struct Model Go
    looked_up_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tạo bảng refresh_tokens (thay Redis: lưu refresh token mỗi user kèm hạn dùng)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vá các DB cũ đã tạo bảng trước khi bổ sung cột (idempotent, an toàn chạy lại)
ALTER TABLE users          ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products       ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products       ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE clinics        ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clinics        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE clinics        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE warranty_cards ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1;
ALTER TABLE warranty_cards ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE warranty_cards ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE warranty_cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Cho phép sửa mã thẻ: khoá ngoại lịch sử tra cứu cascade theo cả UPDATE lẫn DELETE
-- (mặc định cũ chỉ có ON DELETE, đổi code sẽ vi phạm FK nếu đã có log tra cứu).
ALTER TABLE warranty_lookups DROP CONSTRAINT IF EXISTS warranty_lookups_code_fkey;
ALTER TABLE warranty_lookups ADD CONSTRAINT warranty_lookups_code_fkey
    FOREIGN KEY (code) REFERENCES warranty_cards(code) ON UPDATE CASCADE ON DELETE CASCADE;

-- Tự động tạo các index tối ưu hóa hiệu năng tra cứu
CREATE INDEX IF NOT EXISTS idx_warranty_cards_code ON warranty_cards(code);
CREATE INDEX IF NOT EXISTS idx_warranty_lookups_code ON warranty_lookups(code);

-- Hàm sinh mã thẻ BH-<năm><số thứ tự 4 chữ số>, vd BH-20260001 (khớp regex ^BH-\d+$)
CREATE SEQUENCE IF NOT EXISTS warranty_code_seq START 1;

CREATE OR REPLACE FUNCTION next_warranty_code(p_year INT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'BH-' || p_year::TEXT || LPAD(nextval('warranty_code_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
`

func NewPostgresDB() (*sqlx.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBName,
		config.AppConfig.DBSslMode,
	)
	db, err := sqlx.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("không thể mở kết nối cơ sở dữ liệu: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping tới cơ sở dữ liệu thất bại: %w", err)
	}

	_, err = db.Exec(initSchema)
	if err != nil {
		return nil, fmt.Errorf("tự động tạo bảng thất bại: %w", err)
	}

	return db, nil
}
