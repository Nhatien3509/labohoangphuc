---
sidebar_position: 4
title: Migration Status
description: Trạng thái migration từng module sang kiến trúc v6
---

# Migration Status

Bảng trạng thái migration các module sang kiến trúc v6 (Feature Slice).

> **Cập nhật lần cuối**: 2026-04-07

## Newcomer rule

Khi viết code mới:

1. Luôn dùng DBaaS làm mẫu triển khai.
2. Xem module legacy là dữ liệu vận hành hiện tại, không phải chuẩn kiến trúc mới.
3. Nếu bắt buộc sửa legacy module, chỉ sửa tối thiểu và tránh mở rộng pattern legacy.

## Tóm tắt

- **Reference (hoàn chỉnh)**: 1 module (DBaaS)
- **Partial**: 1 module (file-storage — có `_apis/` nhưng chưa đầy đủ)
- **Legacy**: ~15 modules

## Bảng Chi tiết

| Module | `_apis/` | `_lib/` | validators | schemas | Alias | Decouple | Status |
|--------|:--------:|:-------:|:----------:|:-------:|:-----:|:--------:|--------|
| **dbaas** | ✅ | ✅ | ✅ | ✅ | `@dbaas/*` | ✅ | ✅ **Reference** |
| file-storage | ✅ partial | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | 🔄 Partial |
| backup | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| block-storage | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| cloud-observability | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| cloud-server | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| container-registry | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| devops-sphere | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| dms | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| kms | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| load-balancing | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| marketplace | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| network | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| object-storage | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |
| vpn | ❌ | ❌ `_utils` | ❌ | ❌ | ❌ | ❌ | ⚠️ Legacy |

## Giải thích các cột

| Cột | Ý nghĩa |
|-----|---------|
| `_apis/` | API layer nằm trong module (`server.ts`, `server.actions.ts`, `types.ts`, `urns.ts`) |
| `_lib/` | Đã rename `_utils/` → `_lib/` với barrel `index.ts` |
| validators | Regex & predicate functions tách riêng trong `_lib/validators.ts` |
| schemas | Zod schemas colocated với route (`_components/schemas.ts`) |
| Alias | Có path alias `@{module}/*` trong `tsconfig.json` |
| Decouple | Không còn cross-module imports trực tiếp |

## Cách cập nhật

Khi migrate xong 1 module, update bảng trên và commit kèm PR migration.

:::tip
Thứ tự ưu tiên migration gợi ý: module nào đối tác sẽ phát triển → migrate trước.
:::

## Ví dụ nhanh: legacy vs target

**Không nên copy (legacy):**

```ts
import { listServers } from "@/api/cloud-server";
import { REGEX_NAME } from "../_utils/const";
```

**Nên dùng (target):**

```ts
import { listDBInstances } from "@dbaas/_apis/server";
import { BACKUP_NAME_REGEX } from "@dbaas/_lib/validators";
```

## Bước tiếp theo

1. Đọc [Module anatomy](./module-anatomy.md) để áp dụng chuẩn vào code mới.
2. Làm task đầu tiên theo [First task walkthrough](../getting-started/first-task.md).
