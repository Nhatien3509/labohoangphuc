---
sidebar_position: 3
title: Common Layer
description: Shared layer dùng chung cho toàn bộ ứng dụng
---

# Common Layer (`src/common/`)

Common layer chứa code dùng chung cho toàn bộ ứng dụng. Tất cả modules import qua alias `@common/*`.

## Cấu trúc

```
src/common/
├── components/
│   ├── ui/                    # shadcn/ui primitives (Button, Dialog, Input...)
│   ├── layout/                # App-level layout
│   │   ├── breadcrumb/
│   │   ├── sidebar/
│   │   ├── navigation-menu/
│   │   ├── loading/
│   │   ├── errors/
│   │   └── providers/
│   ├── containers/            # Smart containers
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── dialogs/
│   │   ├── inputs/
│   │   └── selects/
│   ├── cards/
│   ├── icons/
│   ├── images/
│   ├── tables/
│   └── dialogs/
├── hooks/                     # Shared React hooks
├── lib/
│   ├── core/                  # Domain core (routes, auth, permissions)
│   ├── helpers/               # Pure utility functions (str, obj, params...)
│   └── feature-flags/         # Feature flag utilities
└── stores/                    # Shared Zustand stores (StoreProvider)
```

## Khi nào đưa code vào Common?

| Tình huống | Đưa vào Common? |
|------------|:---:|
| Dùng bởi **≥ 2 modules** | ✅ Có |
| UI component tái sử dụng (Button, Table...) | ✅ Có |
| Utility function thuần (format date, string...) | ✅ Có |
| Business logic **chỉ cho 1 module** | ❌ Giữ trong module |
| Component **chỉ dùng ở 1 route** | ❌ Giữ trong `_components/` route |

## Cách Import

```typescript
// ✅ Đúng — dùng alias
import { Button } from "@common/components/ui/button";
import { useBreadcrumb } from "@common/hooks/useBreadcrumb";
import { toTitleCase } from "@common/lib/helpers/str";
import { createStoreContext } from "@common/stores/StoreProvider";

// ❌ Sai — import trực tiếp qua path dài
import { Button } from "@/common/components/ui/button";
import { useBreadcrumb } from "../../common/hooks/useBreadcrumb";
```

## Bridge Files (giai đoạn migration)

Trong quá trình migration, một số file cũ ở `src/hooks/`, `src/components/`, `src/utils/` vẫn tồn tại dưới dạng **bridge** — chúng re-export từ `@common/*`. Đây là giải pháp tạm để các module chưa migrate không bị broken.

:::warning
**Không import qua bridge paths** trong code mới. Luôn dùng `@common/*` trực tiếp.
:::

```typescript
// ❌ Sai — import qua bridge (legacy path)
import { useAuth } from "@/hooks/useAuth";

// ✅ Đúng — import trực tiếp từ common
import { useAuth } from "@common/hooks/useAuth";
```
