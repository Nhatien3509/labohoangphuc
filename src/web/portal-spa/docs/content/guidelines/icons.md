---
sidebar_position: 8
title: Icons
description: Hướng dẫn sử dụng Icon Library
---

# Icons

Dự án sử dụng bộ **custom SVG icons** riêng, đặt tại `src/common/components/icons/`.  
Hiện tại có **~230 icons** bao phủ hầu hết nhu cầu UI của toàn bộ hệ thống.

:::tip Xem trực quan tất cả icons
Mở **Storybook → Foundation / Icon Library** để:
- Tìm kiếm icon theo tên
- Xem preview ở nhiều kích thước & màu sắc
- **Click vào icon** để tự động copy import statement

```bash
pnpm storybook    # mở Storybook tại http://localhost:6006
```
:::

---

## Cách import

Luôn import từ barrel `@common/components/icons`:

```tsx
import { Settings, Delete, Plus } from "@common/components/icons";
```

**Không** import trực tiếp từ file component:

```tsx
// ❌ Tránh
import { Settings } from "@common/components/icons/Settings";

// ✅ Đúng
import { Settings } from "@common/components/icons";
```

---

## Props

Tất cả icons đều nhận `SVG1DProps`:

| Prop        | Type     | Default | Mô tả                                    |
| ----------- | -------- | ------- | ----------------------------------------- |
| `size`      | `number` | `24`    | Kích thước `width` & `height` (px)        |
| `className` | `string` | —       | Class CSS bổ sung (Tailwind, etc.)        |
| `...props`  | SVG attrs| —       | Tất cả thuộc tính SVG khác (`onClick`, …) |

### Ví dụ sử dụng

```tsx
{/* Kích thước mặc định (24px) */}
<Settings />

{/* Tuỳ chỉnh kích thước */}
<Settings size={16} />

{/* Với Tailwind class */}
<Settings className="text-primary" />
<Delete className="text-destructive w-5 h-5" />
```

---

## Kích thước chuẩn

Sử dụng các bước kích thước nhất quán trong toàn bộ ứng dụng:

| Ngữ cảnh                  | Size (px) | Ví dụ                                |
| ------------------------- | --------- | ------------------------------------- |
| Inline text / small button | `16`      | `<ChevronRight size={16} />`         |
| Button / table action      | `20`      | `<Delete size={20} />`               |
| Default / card             | `24`      | `<Settings />`                       |
| Page header / spotlight    | `32`      | `<Cloud size={32} />`                |
| Feature illustration       | `48–64`   | `<DBaaS size={48} />`               |

---

## Màu sắc

Icons mặc định dùng `fill="currentColor"`, nên **màu được kế thừa từ parent**:

```tsx
{/* Kế thừa text color */}
<span className="text-muted-foreground">
  <Settings />
</span>

{/* Dùng Tailwind trực tiếp */}
<Settings className="text-primary" />
<Delete className="text-destructive" />
<CheckCircle className="text-green-500" />
```

:::caution Ngoại lệ
Một số icon có màu cố định (branding icons): `MySQLIcon`, `PostgreSQLIcon`, `MariaDBIcon`, `RedisIcon`, `VietnamFlag`, `VietnamFlagCircle`, `UKFlagCircle`.  
Các icon này **không** tuân theo `currentColor`.
:::

---

## Phân loại

### Navigation & Action

| Tên | Mô tả |
|-----|-------|
| `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` | Mũi tên di chuyển |
| `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown` | Chevron (dropdown, accordion) |
| `Back`, `BackToTop` | Quay lại / lên đầu trang |
| `Close`, `X` | Đóng dialog / panel |
| `Search`, `Loupe` | Tìm kiếm |
| `Filter`, `Sort`, `SortAZ`, `SortZA` | Lọc & sắp xếp |
| `Plus`, `Minus`, `Edit`, `Delete` | CRUD |

### Status & Feedback
| Tên | Mô tả |
|-----|-------|
| `Success`, `CheckCircle`, `Completed` | Thành công |
| `Warning`, `WarningSmall`, `WarningOrange` | Cảnh báo |
| `Danger`, `Failed`, `AlertOctagon` | Lỗi / nguy hiểm |
| `InfoAlert`, `Infor`, `Information` | Thông tin |
| `Spinner`, `Loading` | Trạng thái loading |

### Cloud & Infrastructure
| Tên | Mô tả |
|-----|-------|
| `Server`, `BareMetal`, `Cloud` | Compute |
| `Volume`, `BlockStorage`, `ObjectStorage`, `FileStorage` | Storage |
| `Network`, `NetworkWithLock`, `LoadBalancer` | Network |
| `Kubernetes`, `Cluster` | Container |
| `DBaaS` | Database as a Service |
| `KeyManagement`, `Certificate`, `Lock` | Security |
| `Backup`, `BackupService`, `BackupSnapshot` | Backup |

---

## Thêm icon mới

1. Tạo file component trong `src/common/components/icons/`:

```tsx
// src/common/components/icons/NewIcon.tsx
import type { SVG1DProps } from "@common/components/icons/types";

export const NewIcon = ({ size = 24, className, ...props }: SVG1DProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* SVG paths from Figma */}
    <path d="..." fill="currentColor" />
  </svg>
);
```

2. Export từ barrel file:

```ts
// src/common/components/icons/index.ts
export { NewIcon } from "./NewIcon";
```

3. Kiểm tra trong Storybook — icon mới sẽ **tự động xuất hiện** trong Icon Library.

---

## Quy tắc

| Quy tắc | Chi tiết |
|---------|----------|
| ✅ Dùng `currentColor` | Cho phép icon kế thừa text color |
| ✅ Dùng `SVG1DProps` | Đảm bảo interface nhất quán |
| ✅ Default `size={24}` | Kích thước mặc định chuẩn |
| ✅ Dùng `BaseIcon` khi có thể | Giảm code lặp, đảm bảo chuẩn |
| ❌ Không import từ file riêng | Luôn import từ barrel `@common/components/icons` |
| ❌ Không hardcode màu | Trừ branding icons (MySQL, PostgreSQL, …) |
| ❌ Không dùng `img` tag cho SVG | Dùng inline SVG component |
