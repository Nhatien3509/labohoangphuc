---
sidebar_position: 2
title: Thực trạng & tiêu chuẩn
description: Technical debt, kiến trúc modular, best practices và style guide
---

# Thực trạng & tiêu chuẩn

## Mục tiêu

- Mô tả **technical debt** hiện có và **tiêu chuẩn phát triển mới** để tránh lặp lại cấu trúc legacy.
- Căn chỉnh team vào **Feature Slice / modular domain** với **DBaaS** làm reference implementation.

## Hướng dẫn chi tiết

### Technical debt (rút gọn)

- **Hai tốc độ kiến trúc:** nhiều module vẫn **legacy** (API dưới `src/api/{module}/`, `_utils/`, `_actions/`, import `@/api/...`). Module chuẩn dùng **`app/[locale]/<domain>/_apis/`**, `_lib/`, alias `@<domain>/*` (khi đã cấu hình).
- **Storybook:** chưa đủ story cho mọi primitive → developer dễ **tự dựng UI lệch design** nếu không đọc handbook + Figma.
- **Rủi ro:** copy cấu trúc legacy làm “mẫu mới”, import chéo feature, phân tán quy tắc form.

Chi tiết bảng module: [Migration status](../architecture/migration-status.md).

### Tiêu chuẩn mới (best practices)

1. **Code mới** (và mọi refactor có ngân sách) bám [Module anatomy (DBaaS)](../architecture/module-anatomy.md): `_apis/`, `_lib/` (validators, helpers, const), route + `_components/` với `schemas.ts` colocated.
2. **Không** mở rộng `src/api/` cho domain đang hướng slice — trừ khi team có ngoại lệ ghi trong MR/ADR.
3. **Tuân** [Coding standards](../guidelines/coding-standards.md), [Lint & quality](../guidelines/lint-and-quality.md), import rules và ranh giới module.
4. **UI:** ưu tiên `@common/components/` và containers; styling chỉ qua **Tailwind + design kit** — không CSS tùy ý, không hardcode màu/spacing ngoài convention; chi tiết [UI Components — quan điểm styling](../guidelines/ui-components.md#styling-and-design-kit).
5. **Review:** MR mô tả rõ “theo DBaaS slice” hoặc “legacy — lý do chưa migrate”.
6. **Agent (AI assistant):** skill đồng bộ repo tại `.agents/skills/` — mô tả đầy đủ [Agent skills trong repo](../contributing/agent-skills.md).

### Style guide (tóm tắt)

- TypeScript strict; tránh `any` không lý do.
- Form: React Hook Form + Zod — xem [Form & validation](../guidelines/form-and-validation.md).
- Test: theo **lộ trình phase** (logic mới → component mới → toàn source) — chi tiết [Testing](../workflow/testing.md).

## Ví dụ

**Sai (legacy pattern):**

```text
src/api/my-service/foo.actions.ts
app/[locale]/my-service/_utils/validators.ts
```

**Đúng (hướng modular, tham chiếu DBaaS):**

```text
src/app/[locale]/my-service/_apis/server.ts
src/app/[locale]/my-service/_apis/server.actions.ts
src/app/[locale]/my-service/_lib/validators.ts
```

Tham chiếu đầy đủ: [Tổng quan kiến trúc](../architecture/overview.md).
