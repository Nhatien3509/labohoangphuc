-- ============================================================================
-- Dữ liệu mẫu để test.
--   Tài khoản admin:  admin@labo.vn  /  Admin@123
--   Clinic mẫu:  22222222-2222-2222-2222-222222222222
--   Product mẫu: 11111111-1111-1111-1111-111111111111
-- ============================================================================

-- Mật khẩu 'Admin@123' đã băm bằng bcrypt (cost 10).
INSERT INTO users (id, full_name, email, phone, password_hash, role, status)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Quản trị viên',
    'admin@labo.vn',
    '0900000000',
    '$2a$10$ZKpInJsnybGfprTfqGsOXe0FGWWQKYld401eU1tnb3Ir2yhe.x8xu',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO products (id, code, name, warranty_months, material_origin, status)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'VENUS',
    'Răng sứ Venus',
    84,
    'Đức',
    'active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clinics (id, name, province, phone, contact_person, status)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Nha khoa Smile',
    'Hà Nội',
    '0987654321',
    'BS. Minh',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Một thẻ bảo hành mẫu để tra cứu công khai ngay: mã BH-20260001.
INSERT INTO warranty_cards (
    code, customer_name, customer_phone, clinic_id, product_id, lab_name,
    tooth_positions, warranty_months, issue_date, expiry_date, status, note, created_by
) VALUES (
    'BH-20260001',
    'Nguyễn Văn A',
    '0911222333',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Lab Hà Nội',
    ARRAY[11, 12, 21]::INT[],
    84,
    '2026-01-15',
    '2033-01-15',
    'active',
    'Thẻ mẫu seed',
    '33333333-3333-3333-3333-333333333333'
) ON CONFLICT (code) DO NOTHING;

-- Thẻ seed đã dùng mã thứ tự 1, đẩy sequence lên để CreateCard sinh mã kế tiếp.
SELECT setval('warranty_code_seq', 1, true);

