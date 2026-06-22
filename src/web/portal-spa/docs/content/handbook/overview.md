---
sidebar_position: 1
title: Engineering Handbook — Tổng quan
description: Developer Guide — SSOT khi Storybook chưa đủ và lộ trình đọc tài liệu
---

# Engineering Handbook — Tổng quan

## Mục tiêu

- Cung cấp **một lộ trình đọc** và **nguồn mô tả thống nhất** cho developer Frontend, đặc biệt khi **Storybook chưa phủ hết** primitive và pattern.
- Làm rõ thứ tự ưu tiên: **Handbook (hướng dẫn hành vi)** → **Guidelines chi tiết** → **Code reference (module DBaaS)**.

## Hướng dẫn chi tiết

**Người mới:** hoàn thành [Getting Started — lộ trình tổng quan](../getting-started/index.md) (môi trường, kiến trúc, MR đầu tiên) **trước** khi đi sâu các mục “tuần” bên dưới. Handbook bổ sung *cách làm việc hàng ngày* và tra cứu nhanh, không thay thế hub Getting Started.

### Handbook vs Storybook vs code

| Nguồn | Vai trò |
|--------|---------|
| **Handbook** (các trang trong mục này) | Chuẩn hóa *cách làm*, checklist, triết lý, link Figma + path code mẫu. |
| **Storybook** (`pnpm storybook`) | Catalog trực quan cho component đã có story — ưu tiên khi tồn tại. |
| **Module reference** (`src/app/[locale]/dbaas/`) | **Ground truth** cho cấu trúc **Feature Slice / modular domain**. |

Khi Storybook thiếu story cho một primitive, hãy: (1) đọc [Component usage](./component-usage.md) và [UI Components](../guidelines/ui-components.md); (2) mở implementation trong `src/common/components/`; (3) đối chiếu Figma trong [References](./references.md).

### Mục lục Handbook

1. [Thực trạng & tiêu chuẩn](./vision-and-standards.md) — technical debt, chuẩn mới, best practices.
2. [References](./references.md) — stack, Figma master, ánh xạ design ↔ code (DBaaS), bản đồ tài liệu.
3. [Component usage](./component-usage.md) — Table, Card, Dialog, Form khi chưa có Storybook + A11y.
4. [Philosophy](./philosophy.md) — state, loading/error, feature flags.
5. [Global impact modules](./global-impact-modules.md) — Allowed Actions, Billing, cost estimate.
6. [How to find code](./how-to-find-code.md) — định vị nhanh theo tác vụ.

### Lộ trình đọc theo tuần (sau Getting Started)

Áp dụng khi đã xong [Getting Started](../getting-started/index.md) và nắm cơ bản kiến trúc — **không** lặp lại setup/onboarding ở đây.

- **Tuần 1 — thao tác repo:** [References](./references.md), [How to find code](./how-to-find-code.md), [Module playbook](../guidelines/module-playbook.md) (playbook + responsive baseline).
- **Tuần 2 — UI & runtime:** [Component usage](./component-usage.md), [Philosophy](./philosophy.md).
- **Tuần 3+ — theo task:** [Global impact modules](./global-impact-modules.md).

### Liên kết tài liệu đã có (đọc song song)

- Kiến trúc: [Tổng quan](../architecture/overview.md), [Module anatomy (DBaaS)](../architecture/module-anatomy.md), [Migration status](../architecture/migration-status.md).
- Guidelines: [Coding standards](../guidelines/coding-standards.md), [Common patterns](../guidelines/common-patterns.md), [API integration](../guidelines/api-integration.md), [Form & validation](../guidelines/form-and-validation.md), [State management](../guidelines/state-management.md).
- Quy trình: [Testing](../workflow/testing.md), [Code review](../workflow/code-review.md).
- Agent skills: [Agent skills trong repo](../contributing/agent-skills.md) (`.agents/skills/`).

## Ví dụ

**Tình huống:** Cần thêm màn danh sách + form tạo cho một dịch vụ mới.

1. Đọc [Module playbook](../guidelines/module-playbook.md) (playbook + responsive baseline).
2. Copy **cấu trúc thư mục** từ `dbaas/`, không copy từ module legacy (xem [Migration status](../architecture/migration-status.md)).
3. Mở Figma file Components trong [References](./references.md); gắn `node-id` màn hình vào MR.

## Bước tiếp theo

Nếu đã qua [Getting Started](../getting-started/index.md), đọc tiếp theo hướng làm việc:

1. [How to find code](./how-to-find-code.md)
2. [Module playbook](../guidelines/module-playbook.md)
3. Cấu trúc thư mục chi tiết: [Module anatomy (DBaaS)](../architecture/module-anatomy.md) (đã giới thiệu trong Getting Started — quay lại khi implement feature).
