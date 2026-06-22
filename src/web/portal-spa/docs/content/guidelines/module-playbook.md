---
sidebar_position: 8
title: Module playbook
description: Checklist triển khai dịch vụ mới theo Feature Slice và baseline responsive an toàn
---

# Module playbook

## Mục tiêu

- Cung cấp checklist triển khai module/tính năng mới theo Feature Slice.
- Đặt một nơi SSOT cho policy feature flag master và responsive baseline khi implement.

## Khi nào dùng

- Tạo module mới hoặc bổ sung surface mới ra UI.
- Refactor module về cấu trúc modern (`_apis/`, `_lib/`, `_hooks/`, `_stores/`).
- Cần checklist review nhanh cho rollout an toàn.

## Common cases

- Bảng tra tình huống thông dụng: [Patterns thường gặp](./common-patterns.md).
- Quy ước chi tiết theo từng chủ đề: [API integration](./api-integration.md), [Form & validation](./form-and-validation.md), [State management](./state-management.md), [UI components](./ui-components.md).

## Playbook - triển khai dịch vụ mới (modular) {#playbook-modular-service}

1. **Cấu trúc thư mục** dưới `src/app/[locale]/<domain>/` với `_apis/`, `_lib/`, `_hooks/` / `_stores/` nếu cần - xem [Module anatomy](../architecture/module-anatomy.md). Khởi tạo nhanh: `pnpm gen:module <slug>`.
2. **API layer:** `server.ts` (read), `server.actions.ts` (mutations, `"use server"`), `types.ts`, `urns.ts`, `index.ts` barrel.
3. **Route:** `page.tsx` + `_components/`; Zod trong `schemas.ts` cạnh form/route; validators tái sử dụng trong `_lib/validators.ts`.
4. **Alias:** cấu hình `@<domain>/*` trong tsconfig (và alias test nếu có) - `gen:module` đã patch; nếu làm tay thì đối chiếu `tools/generate-feature/lib/patch-config.mjs`.
5. **Phân quyền UI:** đồng bộ URNs với backend; áp dụng allowed actions pattern - xem [Global impact modules](../handbook/global-impact-modules.md).
6. **Feature flag (mặc định bắt buộc cho module / bề mặt mới):** mọi module hoặc tính năng đưa lên Console cần một master flag (`..._ENABLE` + đăng ký trong `src/common/lib/feature-flags/config.ts` + validate trong `src/env.js`) để rollout an toàn. `pnpm gen:module` mặc định thêm cờ này (và dòng `.env.example`); dùng `--no-feature-flag` chỉ khi team đã đồng ý ngoại lệ. Sau đó gate menu, route, hoặc layout bằng `getFeatureFlags` / `FeatureKey` - xem [Philosophy - Feature flags](../handbook/philosophy.md#feature-flags). Checklist MR: [Git Flow - MR checklist](../workflow/git-flow.md#mr-checklist).

## Responsive {#responsive}

- Mobile-first; bảng cần có scroll ngang hoặc ẩn cột phụ theo design; không chỉ thu nhỏ chữ.
- Khi design kit chưa phủ đủ breakpoint: ưu tiên không vỡ layout, nội dung chính linh hoạt (`flex`, `min-w-0`, `overflow-x-auto` ở vùng bảng).
- Hướng dẫn thực thi chi tiết: [Agent skills - responsive](../contributing/agent-skills.md#repo-agent-skills).

## Tham chiếu nhanh

- [Architecture overview](../architecture/overview.md)
- [Module anatomy](../architecture/module-anatomy.md)
- [Environment variables](../getting-started/environment-variables.md)
- [Code review](../workflow/code-review.md)