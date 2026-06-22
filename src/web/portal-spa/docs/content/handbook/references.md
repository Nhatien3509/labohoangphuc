---
sidebar_position: 3
title: References — Stack & Figma
description: Danh mục framework/library, liên kết Figma master, và bảng ánh xạ thiết kế ↔ code (DBaaS)
---

# References — Stack & Figma

## Mục tiêu

- Một trang **tra cứu nhanh** stack kỹ thuật và **mọi liên kết Figma** dùng trong dự án.
- Quy ước dẫn link thiết kế trong MR/issue.
- Bảng **ánh xạ thiết kế ↔ code** (ví dụ module DBaaS) để dev có mốc tham chiếu nhanh.

## Hướng dẫn chi tiết

### Framework & thư viện chính

| Lớp | Công nghệ | Ghi chú |
|-----|-----------|---------|
| Framework | **Next.js** (App Router) | RSC + Client Components khi cần tương tác |
| Ngôn ngữ | **TypeScript** | Ưu tiên type từ API layer |
| Styling | **Tailwind CSS** | Không CSS rời; token + spacing theo design kit — [UI Components](../guidelines/ui-components.md#styling-and-design-kit) |
| UI primitives | **shadcn/ui** + **Radix UI** | Dialog, Dropdown, Tooltip, … |
| Form | **React Hook Form** + **Zod** | Schema colocated route |
| Bảng | **TanStack Table** | Thường qua container trong `@common` |
| State (global) | **Zustand** | Layout, flags, allowed actions — có chừng mực |
| Test | **Vitest** | Xem [Testing](../workflow/testing.md) |
| Catalog UI | **Storybook** | `pnpm storybook` — bổ sung dần coverage |

Chi tiết UI và quan điểm styling: [UI Components](../guidelines/ui-components.md) (mục [Tailwind & design kit](../guidelines/ui-components.md#styling-and-design-kit)).

### CLI dự án & agent skills {#repo-cli}

| Mục | Ghi chú |
|-----|---------|
| **pnpm scripts** | `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm test:coverage`, `pnpm storybook` — khai báo trong `package.json` tại root; chạy trực tiếp trên máy/CI, không phụ thuộc IDE. Nguồn đúng khi có khác biệt: `package.json`. Riêng option của `pnpm gen:module` xem `tools/generate-feature/lib/argv.mjs` và `tools/generate-feature/cli.mjs`. |
| **Agent skills** | File `SKILL.md` trong `.agents/skills/` mô tả convention cho **coding agent / AI assistant** (bất kỳ công cụ nào hỗ trợ nạp skill) — [chi tiết](../contributing/agent-skills.md). |

### Figma — Design System & flows

:::tip Quy ước permalink
Nên dùng link có `node-id` cố định; có thể bỏ query `t=` (session) khi dán vào MR/docs.
:::

| Mục đích | Liên kết |
|----------|----------|
| **Component library (ưu tiên cho dev UI — states, variants)** | _(link Figma nội bộ — do maintainers cung cấp)_ |
| **Product / flows (màn hình tổng thể)** | _(link Figma nội bộ — do maintainers cung cấp)_ |
| **Design Kit (bổ sung)** | _(link Figma nội bộ — do maintainers cung cấp)_ |

**Khi mở task/MR:** ghi rõ *file* Figma + *node-id* màn hình hoặc component; primitive tra **file Components** trước.

### Ánh xạ thiết kế ↔ code (ví dụ — module DBaaS) {#design-code-dbaas}

Bảng dưới là **điểm vào tham chiếu** cho dev: mỗi hàng nối một **luồng / pattern** với file code trong `src/app/[locale]/dbaas/` (ground truth kiến trúc modular — xem [Module anatomy](../architecture/module-anatomy.md)). Prefix `src/app/[locale]/dbaas/` áp dụng cho mọi đường dẫn tương đối bên dưới. Cột **Figma** tạm để trống: bổ sung permalink có `node-id` khi đã có khung thiết kế đối ứng.

| Mẫu / luồng | Figma (permalink + `node-id`) | Code tham chiếu (relative to `dbaas/`) |
|-------------|-------------------------------|----------------------------------------|
| Danh sách DB Instance (trang + bảng) | | `instances/page.tsx` · `instances/_components/DBInstanceTable.tsx` |
| Tạo DB Instance (form nhiều bước, Zod) | | `instances/create/page.tsx` · `instances/create/_components/CreateDBInstance.tsx` · `instances/create/_components/schemas.ts` |
| Chi tiết instance — tab Overview | | `instances/[instanceId]/overview/page.tsx` · `instances/[instanceId]/_components/OverviewTab.tsx` |
| Chi tiết instance — layout, điều hướng tab | | `instances/[instanceId]/layout.tsx` · `instances/[instanceId]/_components/DBInstanceTab.tsx` |
| Danh sách backup (theo instance / module) | | `backups/page.tsx` · `backups/_components/DBInstanceBackupTable.tsx` · `_hooks/useDBInstanceBackupTable.tsx` |
| Chi tiết một backup | | `backups/[backupId]/details/page.tsx` · `backups/[backupId]/details/_components/DBInstanceBackupDetails.tsx` |
| Tab Users / Databases / Backup / Logs (instance) | | `instances/[instanceId]/users/page.tsx` · `instances/[instanceId]/databases/page.tsx` · `instances/[instanceId]/backup/page.tsx` · `instances/[instanceId]/database-logs/page.tsx` · `instances/[instanceId]/operation-logs/page.tsx` |
| Dialog — xóa instance | | `instances/_components/DeleteInstanceDialog.tsx` |
| Dialog — mở rộng dung lượng disk | | `instances/_components/ExtendDiskSizeDialog.tsx` |
| Dialog — tạo backup | | `instances/[instanceId]/_components/CreateBackupDialog.tsx` |
| API layer (read + mutations + URN) | | `_apis/server.ts` · `_apis/server.actions.ts` · `_apis/urns.ts` · `_apis/types.ts` |
| State / context module | | `_stores/DBaaSStoreProvider.tsx` · `layout.tsx` |

### Bản đồ tài liệu trong repo

- Handbook: [Overview](./overview.md).
- Kiến trúc: [Overview](../architecture/overview.md), [Module anatomy](../architecture/module-anatomy.md).
- Giao tiếp công cụ: [Communication](../delivery/communication.md).
- Agent skills: [Agent skills trong repo](../contributing/agent-skills.md).

## Ví dụ

Dòng mô tả trong MR:

```text
UI: Figma Components, node-id=<node-id> (section Button primary).
Code ref: src/app/[locale]/dbaas/instances/_components/DBInstanceTable.tsx
```
