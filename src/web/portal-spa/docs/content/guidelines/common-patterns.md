---
sidebar_position: 3
title: Patterns thường gặp
description: Mục lục nhanh các tình huống hay gặp và link tới guideline chi tiết
---

# Patterns thường gặp

Trang này là **mục lục tham khảo**: mỗi mục trỏ tới guideline đầy đủ hoặc vị trí code điển hình. Chi tiết quy ước nằm trong [Coding Standards](./coding-standards.md); công cụ lint và chất lượng: [Lint & code quality](./lint-and-quality.md).

## Bảng dữ liệu, phân trang, filter

**Khi nào:** Danh sách tài nguyên (instances, backups, …) với sort/filter và đồng bộ URL.

**Định hướng:** API layer trong `_apis/`; component bảng trong `_components/`; trạng thái lọc/phân trang thường gắn `searchParams` (xem [State Management](./state-management.md)). Tham chiếu module chuẩn: `src/app/[locale]/dbaas/`.

## Form tạo / sửa + validation

**Khi nào:** Màn hình có input, submit, lỗi field-level.

**Định hướng:** React Hook Form + Zod; `validators` tập trung ở `_lib/validators.ts`, schema colocated `schemas.ts` theo route. Xem [Form & Validation](./form-and-validation.md).

```text
_lib/validators.ts  →  route/_components/schemas.ts  →  form component
```

## Gọi API & cache

**Khi nào:** Fetch list/detail, mutations, tags cho revalidate.

**Định hướng:** Quy ước fetch, error handling, và cấu trúc `_apis/` trong [API Integration](./api-integration.md).

## State: client vs server

**Khi nào:** Dữ liệu từ server vs UI tạm, store chia sẻ trong module vs global.

**Định hướng:** Bảng tổng quan và Zustand trong [State Management](./state-management.md).

## UI: component thư viện & layout

**Khi nào:** Button, dialog, bảng, layout — ưu tiên dùng lớp component dùng chung.

**Định hướng:** [UI Components](./ui-components.md), Storybook (`pnpm storybook`) để xem catalog.

## Icon

**Khi nào:** Thêm hoặc đổi icon trong UI thống nhất design system.

**Định hướng:** [Icons](./icons.md).

## Anti-pattern nhanh

- Copy cấu trúc module **legacy** (API ở `src/api/…`, `_utils/` thay cho `_lib/`) — xem [Migration Status](../architecture/migration-status.md).
- Import chéo module feature không được phép — tuân [Coding Standards](./coding-standards.md) (import rules).
