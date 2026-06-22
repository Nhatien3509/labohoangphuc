---
sidebar_position: 2
title: Giải phẫu Module Chuẩn (DBaaS)
description: Cấu trúc chi tiết module chuẩn — lấy DBaaS làm reference implementation
---

# Giải phẫu Module Chuẩn

:::important
**DBaaS là module reference.** Mọi module mới phải theo cấu trúc này.
:::

## TL;DR cho người mới (10 phút)

Nếu bạn chỉ có 10 phút, nắm 5 điểm sau trước:

1. API call của module mới phải ở `_apis/`, không gọi trực tiếp `src/api/{module}`.
2. Business logic nằm trong `_lib/`; regex/predicate ở `validators.ts`.
3. Zod schema đặt cạnh route (`_components/schemas.ts`), không dồn vào `_lib/`.
4. Import nội bộ module dùng alias `@{module}/*`; code dùng chung đưa vào `@common/*`.
5. Không copy pattern từ module legacy (`_utils`, `_actions`, import chéo module).
6. **Feature flag master** cho module/tính năng mới là **mặc định** (env + `src/common/lib/feature-flags/config.ts`); `pnpm gen:module` thêm sẵn — gate menu/route/layout bằng `getFeatureFlags`. Chi tiết: [Module playbook](../guidelines/module-playbook.md#playbook-modular-service), [Philosophy — Feature flags](../handbook/philosophy.md#feature-flags).

## Cấu trúc Tổng quan

```
src/app/[locale]/dbaas/
├── _apis/                      # 🔌 API Layer
│   ├── index.ts                # Barrel: re-export types + server + urns
│   ├── server.ts               # GET / RSC-safe fetch functions
│   ├── server.actions.ts       # "use server" — mutations (POST/PATCH/DELETE)
│   ├── types.ts                # Request & Response TypeScript types
│   └── urns.ts                 # Permission URN map
│
├── _lib/                       # 🧰 Business Logic
│   ├── index.ts                # Barrel: re-export const + helpers + validators
│   ├── const.ts                # UI constants (labels, options, limits) — KHÔNG regex
│   ├── helpers.ts              # Pure utility functions
│   ├── validators.ts           # Validation regex + predicate functions
│   ├── const.test.ts           # Tests
│   ├── helpers.test.ts
│   └── validators.test.ts
│
├── _hooks/                     # 🪝 Module-scoped React Hooks
│   └── useDBInstanceBackupTable.tsx
│
├── _stores/                    # 🗄️ Module-scoped Zustand Stores
│   └── DBaaSStoreProvider.tsx
│
├── instances/                  # 📄 Route: /dbaas/instances
│   ├── _components/
│   │   ├── schemas.ts          # Zod schemas colocated với route
│   │   ├── schemas.test.ts
│   │   ├── DBInstanceTable.tsx
│   │   ├── DBInstanceAction.tsx
│   │   └── ...Dialog.tsx       # Các dialog components
│   ├── create/
│   │   └── page.tsx            # /dbaas/instances/create
│   ├── [instanceId]/
│   │   └── layout.tsx          # Dynamic route layout
│   └── page.tsx                # /dbaas/instances
│
├── backups/                    # 📄 Route: /dbaas/backups
│   ├── _components/
│   └── page.tsx
│
└── layout.tsx                  # Module layout (sidebar, breadcrumb)
```

---

## Chi tiết từng Layer

### 🔌 `_apis/` — API Layer

API layer chứa **toàn bộ** giao tiếp với backend. Không import API từ `src/api/` nữa.

#### `server.ts` — Read-only Fetch (RSC-safe)

Dùng cho Server Components để fetch dữ liệu:

```typescript
// _apis/server.ts
import { apiInstance } from "@/api/instance";
import type { GETResponse } from "@/api/types";
import type { DBInstanceBackup } from "@dbaas/_apis/types";

export const getDBInstanceBackupList = (queries?: DefaultParams) => {
  return apiInstance.get<GETResponse<DBInstanceBackup>>(
    `dbaas/db-instance-backups/`,
    {
      query: queries,
      next: { tags: [DB_INSTANCE_BACKUPS_TAG] },
    },
  );
};
```

#### `server.actions.ts` — Mutations (Server Actions)

Bắt buộc có `"use server"` ở đầu file. Dùng cho mutations (create, update, delete):

```typescript
// _apis/server.actions.ts
"use server";

import type { DBInstanceCreatePayload } from "@dbaas/_apis/types";

export async function createDBInstance(payload: DBInstanceCreatePayload) {
  return apiInstance.post<GETResponse<DBInstance>>(`dbaas/db-instances/`, {
    payload,
  });
}

export async function deleteDBInstance(id: string) {
  return apiInstance.delete<GETResponse<string>>(
    `dbaas/db-instances/${id}/`,
    {},
    [DB_INSTANCES_TAG],
  );
}
```

#### `types.ts` — TypeScript Types

Tất cả types cho API request/response, enums trạng thái, cache tags:

```typescript
// _apis/types.ts
export const DB_INSTANCES_TAG = "db_instances_tag";

export enum DBInstanceStatusEnum {
  CREATING = "CREATING",
  ACTIVE = "ACTIVE",
  DELETING = "DELETING",
  // ...
}

export type DBInstance = {
  id: string;
  name: string;
  status: DBInstanceStatusEnum;
  // ...
};
```

#### `urns.ts` — Permission URNs

Map tập trung tất cả permission URNs cho module:

```typescript
// _apis/urns.ts
export const urns = {
  dbInstance: {
    list: "urn:action:dbaas:db_instance:list",
    create: "urn:action:dbaas:db_instance:create",
    delete: "urn:action:dbaas:db_instance:delete",
    // ...
  },
  backup: {
    list: "urn:action:dbaas:db_instance_backup:list",
    create: "urn:action:dbaas:db_instance_backup:create",
    // ...
  },
};
```

#### `index.ts` — Barrel Export

Re-export cho consumer. **Không** re-export `server.actions.ts` (import trực tiếp):

```typescript
// _apis/index.ts
export * from "@dbaas/_apis/types";
export * from "@dbaas/_apis/server";
export { urns } from "@dbaas/_apis/urns";
```

---

### 🧰 `_lib/` — Business Logic

#### Quy tắc phân chia

| File | Chứa | KHÔNG chứa |
|------|------|------------|
| `const.ts` | UI labels, options, limits, tab names | ❌ Regex, validation logic |
| `helpers.ts` | Pure utility functions | ❌ Validation regex |
| `validators.ts` | Regex, predicate functions | ❌ UI labels, Zod schemas |

#### `validators.ts` — Validation Regex & Predicates

```typescript
// _lib/validators.ts
/** Regex and predicates used by Zod schemas — not UI constants. */

export const BACKUP_NAME_REGEX = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 _-]+$/;
export const HAS_UPPERCASE_REGEX = /[A-Z]/;
export const HAS_LOWERCASE_REGEX = /[a-z]/;
export const HAS_NUMBER_REGEX = /\d/;

export function isValidRootPassword(value: string): boolean {
  return (
    !value.includes("@") &&
    HAS_LOWERCASE_REGEX.test(value) &&
    HAS_UPPERCASE_REGEX.test(value) &&
    HAS_NUMBER_REGEX.test(value)
  );
}
```

#### `const.ts` — UI Constants (KHÔNG có regex)

```typescript
// _lib/const.ts — examples
export const MIN_DISK_SIZE = 1;
export const MAX_DISK_SIZE = 300;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 32;

export const DB_INSTANCE_TABS = {
  OVERVIEW: "overview",
  BACKUP: "backup",
  OPERATION_LOGS: "operation-logs",
} as const;
```

#### `helpers.ts` — Pure Utilities

```typescript
// _lib/helpers.ts
import { DATABASE_TYPE } from "@dbaas/_lib/const";
import { toTitleCase } from "@common/lib/helpers/str";

export const getDatabaseTypeOptions = () =>
  DATABASE_TYPE.map((i) => ({
    label: toTitleCase(i),
    value: i,
  }));
```

---

### 🗄️ `_stores/` — Module State

Zustand store dùng `createStoreContext` từ common:

```typescript
// _stores/DBaaSStoreProvider.tsx
"use client";

import type { DBInstance } from "@dbaas/_apis/types";
import { createStore } from "zustand";
import { createStoreContext } from "@common/stores/StoreProvider";

type DBInstanceState = {
  DBInstanceInfo: DBInstance;
};

const createDbaasStore = (initState: DBInstanceState) =>
  createStore<DBInstanceState>()(() => ({
    ...initState,
  }));

export const {
  StoreProvider: DbaasStoreProvider,
  useStoreContext: useDbaasStore,
} = createStoreContext<DBInstanceState>(createDbaasStore);
```

---

### 📄 Route `schemas.ts` — Zod Schemas (colocated)

Schemas nằm **cạnh route** sử dụng chúng — không phải trong `_lib/`:

```typescript
// instances/_components/schemas.ts
import { MIN_DISK_SIZE, MAX_DISK_SIZE } from "@dbaas/_lib/const";
import { isValidRootPassword } from "@dbaas/_lib/validators";
import type { DBInstance } from "@dbaas/_apis/types";
import z from "zod";

export function getExtendDiskSizeSchema(record: DBInstance) {
  return z.object({
    newSize: z.number()
      .min(MIN_DISK_SIZE)
      .max(MAX_DISK_SIZE)
      .refine((value) => value * 10 > record.diskSize),
  });
}
```

---

## Anti-patterns ❌

| Sai | Đúng |
|-----|------|
| Đặt regex trong `const.ts` | Đặt regex trong `validators.ts` |
| API call trong component | API call trong `_apis/server.ts` hoặc `server.actions.ts` |
| Import từ `src/api/{module}/` | Import từ `@{module}/_apis/` |
| Import module A từ module B | Extract shared code vào `@common/*` |
| Đặt Zod schema trong `_lib/` | Đặt `schemas.ts` colocated với route |
| Dùng `_utils/` folder name | Dùng `_lib/` |
| Dùng `_actions/` cho permissions | Dùng `_apis/urns.ts` |
| Dùng `_providers/` cho stores | Dùng `_stores/` |

## Tạo Module Mới — Checklist

Khi tạo module mới hoặc migrate module cũ:

- [ ] Tạo `_apis/` với `server.ts`, `server.actions.ts`, `types.ts`, `urns.ts`, `index.ts`
- [ ] Tạo `_lib/` với `const.ts`, `helpers.ts`, `validators.ts`, `index.ts`
- [ ] Tạo `_hooks/` nếu module cần hooks riêng
- [ ] Tạo `_stores/` nếu module cần client state
- [ ] Đặt `schemas.ts` cạnh route tương ứng
- [ ] Thêm alias `@{module}/*` vào `tsconfig.json`
- [ ] Dùng `@{module}/*` cho internal imports
- [ ] Không import trực tiếp từ module khác

## Bước tiếp theo

1. Đối chiếu [Migration Status](./migration-status.md) trước khi chọn module làm mẫu.
2. Đọc [How to find code](../handbook/how-to-find-code.md) để tìm nhanh vị trí cần sửa.
3. Áp dụng vào task đầu tiên theo [First task walkthrough](../getting-started/first-task.md).
