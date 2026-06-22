---
sidebar_position: 1
title: Coding Standards
description: Quy tắc viết code
---

# Coding Standards

## TypeScript

Project sử dụng **TypeScript strict mode** với các rule nghiêm ngặt:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "isolatedModules": true
}
```

### Quy tắc chính

- **Luôn khai báo type** cho function parameters và return types phức tạp
- **Dùng `type` thay `interface`** khi không cần extend (theo project convention)
- **Consistent type imports**: dùng inline type imports

```typescript
// ✅ Đúng
import { type DBInstance, DB_INSTANCES_TAG } from "@dbaas/_apis/types";

// ❌ Sai
import { DBInstance } from "@dbaas/_apis/types";
```

## Naming Conventions

| Thứ | Convention | Ví dụ |
|-----|-----------|-------|
| Folders | kebab-case | `block-storage/`, `cloud-server/` |
| Files — components | PascalCase | `DBInstanceTable.tsx` |
| Files — utilities | camelCase hoặc kebab-case | `helpers.ts`, `validators.ts` |
| React Components | PascalCase | `function DBInstanceAction()` |
| Hooks | `use` prefix + PascalCase | `useDBInstanceBackupTable` |
| Constants | UPPER_SNAKE_CASE | `MAX_DISK_SIZE`, `DB_INSTANCES_TAG` |
| Types / Enums | PascalCase | `DBInstanceStatusEnum`, `FlavorDB` |
| Server Actions | camelCase | `createDBInstance`, `deleteDBInstance` |

## Coding style tham khảo

- Team ưu tiên convention nội bộ trong repo này.
- Khi cần đối chiếu best practices JavaScript tổng quát, tham khảo Airbnb JavaScript Style Guide:
  - https://javascript.airbnb.tech/
- Nếu có khác biệt giữa Airbnb guide và convention nội bộ, ưu tiên convention nội bộ + lint rules hiện tại.

## Private folders (`_` prefix)

Folders bắt đầu bằng `_` không tham gia routing của Next.js App Router:

- `_apis/` — API layer
- `_lib/` — Business logic
- `_hooks/` — React hooks
- `_stores/` — Zustand stores
- `_components/` — Route-scoped UI components

## Lint & định dạng

Chạy **`pnpm lint`** (Prettier + ESLint) trước khi merge; chi tiết công cụ, SonarLint, typecheck và cách thêm rule: [Lint & code quality](./lint-and-quality.md).

```bash
pnpm lint       # check
pnpm lint:fix   # auto-fix
```

## Import Rules

### Thứ tự import (gợi ý)

1. External packages (`react`, `next`, `zod`...)
2. `@common/*` imports
3. `@{module}/*` imports
4. Relative imports (`./`, `../`)

### Forbidden imports

```typescript
// ❌ Module mới KHÔNG dùng
import { ... } from "@/api/{module}/...";        // → dùng @{module}/_apis/
import { ... } from "@/app/[locale]/{module}/..."; // → dùng @{module}/...
import { ... } from "@/hooks/...";                // → dùng @common/hooks/...
import { ... } from "@/components/...";           // → dùng @common/components/...
import { ... } from "@/utils/...";                // → dùng @common/lib/helpers/...
```

## Commit Message

Project đang validate commit message bằng `tools/gitflow/validate-rules.mjs` với format:

```
<type>: <description>

feat: add backup scheduling form
fix: resolve breadcrumb rendering on nested routes
refactor: migrate _utils to _lib
docs: update module anatomy guide
chore: update eslint config
```

Validator cũng chấp nhận commit đặc biệt do Git tạo: `Merge ...`, `Revert ...`.

| Type | Khi nào |
|------|---------|
| `feat` | Thêm feature mới |
| `fix` | Sửa bug |
| `refactor` | Refactor không thay đổi behavior |
| `docs` | Cập nhật tài liệu |
| `chore` | Config, tooling, deps |
| `style` | Đổi format/style, không đổi logic |
| `test` | Thêm/sửa test |
| `build` | Build toolchain/pipeline build |
| `ci` | CI/CD config |
| `perf` | Tối ưu hiệu năng |

Chi tiết branch + MR title rule (bao gồm ticket suffix cho `feat/fix`) xem [Git Flow](../workflow/git-flow.md).
