---
sidebar_position: 3
title: Biến môi trường
description: Danh sách và cách kiểm tra biến môi trường khi chạy local
---

# Biến môi trường

Trang này giúp developer mới kiểm tra nhanh file `.env` trước khi chạy local.

## Cách dùng

1. Sao chép file mẫu: `cp .env.example .env`
2. Điền giá trị theo môi trường của team.
3. Không commit `.env` chứa secret vào git.

## Bảng kiểm tra tối thiểu

| Nhóm | Cần gì | Nguồn lấy |
|------|--------|-----------|
| API backend | Base URL đúng môi trường | Maintainers / tài liệu nội bộ |
| Auth/OIDC | Client ID, issuer, callback URL | Maintainers / IAM team |
| Feature flags | Các cờ bật/tắt theo môi trường | `src/common/lib/feature-flags/config.ts` + maintainers |

Khi tạo module mới bằng `pnpm gen:module <slug>`, CLI **mặc định** thêm một dòng cờ `…_ENABLE` tương ứng vào `.env.example` và `src/env.js` (và đăng ký trong `config.ts`). Đây khớp **chính sách** “module/tính năng mới có master feature flag” — xem [Module playbook](../guidelines/module-playbook.md#playbook-modular-service). Sao chép biến đó sang `.env` local nếu cần bật module khi dev.

## Tự kiểm tra nhanh

- [ ] Chạy `pnpm dev` không báo lỗi thiếu env.
- [ ] Đăng nhập được với tài khoản test.
- [ ] Mở được ít nhất một màn dữ liệu (list hoặc dashboard).

## Lỗi thường gặp

- Sai URL backend: request trả về 404 hoặc network error.
- Thiếu biến auth: redirect login lặp hoặc callback fail.
- Cấu hình flag sai: menu/module bị ẩn ngoài mong đợi.