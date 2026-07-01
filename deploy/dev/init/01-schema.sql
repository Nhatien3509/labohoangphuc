-- ============================================================================
-- Schema DEV đầy đủ cho labo-warranty.
-- Định nghĩa bảng với ĐỦ cột mà tầng code đang dùng (note, updated_at, quantity)
-- và hàm sinh mã next_warranty_code() mà CreateCard gọi tới — những thứ còn
-- thiếu trong initSchema tự sinh của backend.
--
-- File này chạy TRƯỚC khi backend khởi động, nên `CREATE TABLE IF NOT EXISTS`
-- trong backend sẽ là no-op (giữ nguyên schema đúng ở đây).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

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

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    warranty_months INT NOT NULL,
    material_origin TEXT,
    description TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS warranty_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    clinic_name TEXT,
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

CREATE TABLE IF NOT EXISTS warranty_lookups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL REFERENCES warranty_cards(code) ON UPDATE CASCADE ON DELETE CASCADE,
    found BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    looked_up_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranty_cards_code ON warranty_cards(code);
CREATE INDEX IF NOT EXISTS idx_warranty_lookups_code ON warranty_lookups(code);

-- Hàm sinh mã thẻ dạng BH-<năm><số thứ tự 4 chữ số>, vd: BH-20260001.
-- Khớp regex tra cứu công khai ở backend: ^BH-\d+$.
CREATE SEQUENCE IF NOT EXISTS warranty_code_seq START 1;

CREATE OR REPLACE FUNCTION next_warranty_code(p_year INT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'BH-' || p_year::TEXT || LPAD(nextval('warranty_code_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
