# Admin Service

Dịch vụ quản trị hệ thống - quản lý người dùng, phân quyền, danh mục hệ thống.

## Chức năng chính

- Quản lý tài khoản người dùng
- Phân quyền truy cập (RBAC)
- Quản lý danh mục phần mềm kết nối
- Quản lý mã lỗi
- Đồng bộ SSO/Identity từ ĐMDC (OIDC + PKCE)

## Hạ tầng phụ thuộc

- PostgreSQL (metadata)
- Redis (session, cache)
