---
sidebar_position: 4
title: API Integration
description: Cách viết API layer theo chuẩn module v6
---

# API Integration

Hướng dẫn xây dựng `_apis/` layer cho module — tách rõ read (RSC) vs write (Server Actions).

## Cấu trúc `_apis/`

```
{module}/_apis/
├── index.ts            # Barrel re-export
├── server.ts           # GET / RSC-safe fetch
├── server.actions.ts   # "use server" — mutations
├── types.ts            # TypeScript types & cache tags
└── urns.ts             # Permission URN map
```

## `server.ts` — Read-only Fetch

Dùng trong **Server Components** để fetch dữ liệu. Không cần `"use server"`.

```typescript
import { apiInstance } from "@/api/instance";
import type { GETResponse } from "@/api/types";
import type { DBInstanceBackup, DB_INSTANCE_BACKUPS_TAG } from "@dbaas/_apis/types";
import type { DefaultParams } from "@common/lib/helpers/params";

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

:::tip
Sử dụng `next.tags` cho cache revalidation. Định nghĩa tag constants trong `types.ts`.
:::

## `server.actions.ts` — Mutations

**Bắt buộc** có `"use server"` ở dòng đầu tiên. Dùng cho POST, PATCH, PUT, DELETE.

```typescript
"use server";

import { apiInstance } from "@/api/instance";
import { DB_INSTANCES_TAG } from "@dbaas/_apis/types";

export async function deleteDBInstance(id: string) {
  return apiInstance.delete<GETResponse<string>>(
    `dbaas/db-instances/${id}/`,
    {},
    [DB_INSTANCES_TAG],  // revalidate cache
  );
}
```

## `types.ts` — Types & Cache Tags

```typescript
// Cache tags cho revalidation
export const DB_INSTANCES_TAG = "db_instances_tag";
export const DB_INSTANCE_BACKUPS_TAG = "db_instance_backups_tag";

// Enums
export enum DBInstanceStatusEnum {
  CREATING = "CREATING",
  ACTIVE = "ACTIVE",
  ERROR = "ERROR",
}

// Types
export type DBInstance = {
  id: string;
  name: string;
  status: DBInstanceStatusEnum;
  // ...
};

// Payloads
export type DBInstanceCreatePayload = {
  name: string;
  region: string;
  // ...
};
```

## `urns.ts` — Permission Map

```typescript
export const urns = {
  dbInstance: {
    list: "urn:action:dbaas:db_instance:list",
    create: "urn:action:dbaas:db_instance:create",
    delete: "urn:action:dbaas:db_instance:delete",
  },
};
```

## `index.ts` — Barrel Export

**Chỉ** re-export types, server functions, và urns. **Không** re-export server actions:

```typescript
export * from "@dbaas/_apis/types";
export * from "@dbaas/_apis/server";
export { urns } from "@dbaas/_apis/urns";
// ⚠️ KHÔNG export server.actions.ts ở đây
```

Consumer import server actions trực tiếp:

```typescript
// ✅ Import server actions trực tiếp
import { deleteDBInstance } from "@dbaas/_apis/server.actions";

// ✅ Import types/server qua barrel
import { type DBInstance, getDBInstanceBackupList } from "@dbaas/_apis";
```

## Pattern: Trang danh sách có phân quyền (chuẩn trong codebase)

Màn **list** thường dùng **`withPage`** (`@common/components/layout/PageGenerator`) + **`checkProjectAllowedActions`** + `ERROR_403`, rồi mới gọi API list — không lấy ví dụ RSC tối giản bên dưới làm mẫu cho list production.

Tham chiếu thực tế: `src/app/[locale]/dbaas/instances/page.tsx`. Chi tiết phân quyền: [Global impact modules](../handbook/global-impact-modules.md).

## Pattern: Read trong RSC (không qua `withPage`)

Khi một Server Component gọi hàm read từ `server.ts` / `server.actions.ts`, luôn xử lý **`FetchResult`** (`success`, `status`, `error`) — không giả định `data` luôn tồn tại.

```tsx
import { getDBInstanceBackupList } from "@dbaas/_apis/server";

export default async function BackupsSection() {
  const res = await getDBInstanceBackupList();
  if (!res.success) {
    return null; // hoặc fallback / thông báo lỗi theo pattern màn hình
  }
  return <BackupTable data={res.data} />;
}
```

:::tip
`dbaas/instances` list **thực tế** dùng `withPage` + URN; đoạn trên minh họa **hợp đồng `FetchResult`** cho read trong RSC.
:::

## Pattern: Client Mutation

```tsx
// _components/DeleteInstanceDialog.tsx (Client Component)
"use client";

import { deleteDBInstance } from "@dbaas/_apis/server.actions";

function DeleteInstanceDialog({ id }: { id: string }) {
  const handleDelete = async () => {
    await deleteDBInstance(id);
    // revalidation tự động qua cache tags
  };
  // ...
}
```
