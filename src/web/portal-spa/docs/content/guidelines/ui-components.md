---
sidebar_position: 7
title: UI Components
description: Quan điểm styling (Tailwind, design kit), shadcn/ui, Storybook
---

# UI Components

Khi **chưa có Storybook** cho một primitive hoặc pattern (Table, Dialog, Form, …), xem thêm [Component usage trong Handbook](../handbook/component-usage.md) — hướng dẫn tra code + **Accessibility (ARIA)**.

## Quan điểm styling (Tailwind & design kit) {#styling-and-design-kit}

Dự án dùng **Tailwind CSS** làm cách chính để style UI. Các nguyên tắc sau giữ giao diện thống nhất với **design kit** (Figma — xem [References](../handbook/references.md)):

- **Không thêm CSS tùy ý** cho feature (không file `.css` / module CSS riêng, không class viết tay ngoài luồng design system) ngoại trừ **mở rộng tập trung** mà team thống nhất (ví dụ token trong `src/styles/globals.css`, cấu hình theme Tailwind). Component từ shadcn/ui có thể kèm layer Tailwind/`@layer` theo chuẩn thư viện — đó là phần của stack, không coi là “custom CSS” lẻ tẻ theo màn hình.
- **Không hardcode** màu, font, border, shadow **ngoài convention** đã map sang token / utility: ưu tiên class semantic (`bg-background`, `text-foreground`, `border-border`, …) và scale màu/spacing có trong theme thay vì hex/rgb/`[13px]` rải rác.
- **Khoảng cách & kích thước** bám **spacing/sizing chuẩn thiết kế** — dùng bậc Tailwind (`p-4`, `gap-2`, `max-w-lg`, …) và variant component có sẵn; **tránh arbitrary values** (`mt-[17px]`, `w-[342px]`) trừ khi design spec ghi rõ và đã thống nhất cách đưa vào token hoặc có MR ghi lý do tạm thời.
- **Đối chiếu Figma** (component library + spacing/type scale) trước khi tự chọn số “cho đẹp mắt”; lệch token là nợ UI kỹ thuật.

:::tip
Nếu thiếu token cho một giá trị design lặp lại, ưu tiên **bổ sung vào theme / `globals.css`** (một lần, dùng chung) thay vì nhân bản magic number trong JSX.
:::

## Tech Stack UI

| Công nghệ | Vai trò |
|-----------|---------|
| **shadcn/ui** | Component library (build on Radix UI) |
| **Tailwind CSS** | Utility-first CSS |
| **Radix UI** | Headless primitives (Dialog, Dropdown, Tooltip...) |
| **Storybook** | Component documentation & playground |

## shadcn/ui Components

Nằm trong `src/common/components/ui/`. Đây là các **primitives** đã được tuỳ chỉnh cho project.

```typescript
import { Button } from "@common/components/ui/button";
import { Dialog } from "@common/components/ui/dialog";
import { Input } from "@common/components/ui/input";
```

:::tip
**Kiểm tra `@common/components/` trước khi viết component mới.** Rất có thể đã có sẵn component hoặc container phù hợp.
:::

### Container Components

Ngoài primitives, project có **smart containers** giúp tái sử dụng patterns phổ biến:

```
@common/components/containers/
├── forms/       # Form wrappers
├── tables/      # Table containers
├── dialogs/     # Dialog patterns
├── inputs/      # Input wrappers
└── selects/     # Select wrappers
```

## Tailwind CSS

### Theme tokens

Biến màu và token chung được khai báo tập trung trong `src/styles/globals.css` và được ánh xạ sang utilities Tailwind. Trong component, **dùng class Tailwind** (semantic hoặc scale), không viết thêm rule CSS chỉ để set màu/spacing:

```tsx
// ✅ Đúng — semantic + scale có sẵn
<div className="border-border bg-card text-card-foreground rounded-md p-4">

// ❌ Tránh — hardcode ngoài convention
<div className="bg-[#f2f2f2] p-[13px] border-[1px] border-[#e3e4e4]">
```

### Dark mode

Project hỗ trợ dark mode qua `next-themes`. Class semantic tự đổi theo theme:

```tsx
<div className="bg-background text-foreground">
  {/* Tự động đổi màu theo theme */}
</div>
```

## Storybook

### Chạy Storybook

```bash
pnpm storybook
```

Truy cập **http://localhost:6006** để xem component library.

### Build Storybook (static)

```bash
pnpm build-storybook
```

### Viết Story (khuyến nghị)

Mỗi component trong `@common/components/` nên có story:

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "UI/Button",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Click me",
    variant: "default",
  },
};
```

## Quy tắc

- Dùng **shadcn/ui primitives** và containers `@common/` trước; chỉ mở rộng khi thiếu pattern và đã đối chiếu design.
- **Styling:** Tailwind + token/design kit — xem [Quan điểm styling](#styling-and-design-kit); không CSS rời cho từng màn; hạn chế inline style và arbitrary class.
- Component theo module đặt trong `{route}/_components/`, không nhét logic domain vào `@common/` trừ khi thật sự dùng chung.
- Kiểm tra Storybook / Figma khi không chắc component hoặc khoảng cách chuẩn.
