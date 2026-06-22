---
sidebar_position: 6
title: Triết lý — State, UX runtime, Feature flags
description: Zustand vs local state, loading/error, feature flags env-driven
---

# Triết lý — State, UX runtime, Feature flags

## Mục tiêu

- Chuẩn hóa **nơi đặt state**, cách xử lý **loading/error** trên UI, và **feature flags** trong dự án.

## Hướng dẫn chi tiết

### Component design — chia tách, tái sử dụng, A11y

- **Chia tách:** page gọn; logic nghiệp vụ và format dữ liệu tách khỏi JSX khi file phình (helpers, hooks nhỏ trong `_components/` hoặc `_lib/`).
- **Tái sử dụng:** ưu tiên primitive/container tại `@common/components/`; chỉ đặt component riêng module trong `route/_components/` khi gắn chặt domain.
- **Accessibility:** semantic HTML, label/form, Dialog/Table đúng ARIA — chi tiết [Component usage](./component-usage.md).

### State management — Zustand (global) vs local

**Global (Zustand)** — dùng khi:

- Dữ liệu **chia sẻ nhiều cây component** (layout shell, `allowedActions`, billing context, feature flags đã hydrate).
- Tránh prop drilling sâu qua nhiều lớp không liên quan nghiệp vụ.

**Local state** — ưu tiên khi:

- UI tạm: mở dialog, tab nội bộ, toggle filter không cần đồng bộ URL.
- Form: dùng **React Hook Form** (không nhét form vào global store trừ case đặc biệt).

**Server / URL:**

- List có filter, pagination: ưu tiên **`searchParams`** + RSC fetch khi phù hợp — xem [State management](../guidelines/state-management.md).

### Loading & error (UX/UI)

- **Loading:** ưu tiên **skeleton** theo layout (table, card, form) thay vì spinner giữa trang trống.
- **Error:** phân biệt lỗi mạng, 403, 404; có **thông điệp rõ** và **CTA** (thử lại, quay lại danh sách). Không nuốt lỗi im lặng.
- Chi tiết tích hợp API: [API integration](../guidelines/api-integration.md).

### Feature flags {#feature-flags}

Dự án dùng **cấu hình nội bộ + biến môi trường** (không LaunchDarkly trong codebase hiện tại).

**Chính sách (module / tính năng mới):** mặc định mọi **module hoặc bề mặt người dùng mới** phải có **ít nhất một master flag** (`…_ENABLE` trong env, map trong `config.ts`, validate trong `src/env.js`) để rollout và tắt nhanh khi cần. Scaffold `pnpm gen:module <slug>` **mặc định** thêm cờ đó (và mẫu trong `.env.example`); xem [Module playbook](../guidelines/module-playbook.md#playbook-modular-service) và [Biến môi trường](../getting-started/environment-variables.md). **Ngoại lệ** (không thêm flag) cần **đồng thuận** trong MR/review (ví dụ refactor nội bộ, không đổi UI). Checklist author: [Git Flow — MR checklist](../workflow/git-flow.md#mr-checklist).

- Cây flag: `src/common/lib/feature-flags/config.ts` (key `FeatureKey`).
- Server: `getFeatureFlags` từ `@common/lib/feature-flags/server`.
- Client: `useFeatureFlag` / `useFeatureFlags` từ `@common/hooks/useFeatureFlags`.

Thêm flag mới (khi không dùng `gen:module` hoặc cần cờ phụ): cập nhật `config`, validate env trong `src/env.js`, `.env.example`, và ghi chú release/ops.

## Ví dụ

**Client:**

```tsx
import { useFeatureFlag } from "@common/hooks/useFeatureFlags";

const showDbaas = useFeatureFlag("dbaas.enabled");
```

**Server:**

```ts
import { getFeatureFlags } from "@common/lib/feature-flags/server";

const [isFeatureEnabled] = getFeatureFlags(["module.enabled"]);
```

Tham chiếu thêm: [State management](../guidelines/state-management.md).
