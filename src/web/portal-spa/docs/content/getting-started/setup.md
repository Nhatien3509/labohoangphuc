---
sidebar_position: 1
title: Cài đặt Môi trường
description: Hướng dẫn từng bước cài đặt môi trường phát triển
---

# Cài đặt Môi trường

Hướng dẫn chi tiết để thiết lập môi trường phát triển trên máy local.

## Prerequisites

| Tool | Version | Kiểm tra |
|------|---------|----------|
| Node.js | 20.x (LTS) | `node -v` |
| pnpm | 10.x | `pnpm -v` |
| Git | 2.x+ | `git -v` |

## 1. Cài đặt Node.js (qua nvm)

```bash
# Cài nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Cài Node.js 20
nvm install 20
nvm use 20

# Verify
node -v   # → v20.x.x
```

:::tip
Nếu team quản lý version qua `.nvmrc`, chỉ cần chạy `nvm use` tại root project.
:::

## 2. Cài đặt pnpm

```bash
npm i -g pnpm

# Verify
pnpm -v   # → 10.x.x
```

Project sử dụng `packageManager` field trong `package.json`, nên pnpm sẽ tự verify version phù hợp.

## 3. Registry npm nội bộ (khi cần)

Nếu team dùng **registry npm riêng** (proxy nội bộ, mirror), cấu hình theo hướng dẫn nội bộ — thường gồm URL registry và tùy chọn `strict-ssl`. Không commit credential vào repo.

```bash
# Ví dụ minh họa (thay bằng giá trị do maintainers cung cấp)
# pnpm config set registry <URL_REGISTRY>
# pnpm config get registry
```

:::warning
Mặc định công khai: `https://registry.npmjs.org/`. Chỉ đổi registry khi policy hoặc mạng yêu cầu.
:::

## 4. Clone & Cài đặt Dependencies

```bash
# Clone repo — dùng URL do maintainers cung cấp (HTTPS hoặc SSH)
git clone <URL_REPOSITORY>.git
cd <thư_mục_dự_án>

# Cài deps
pnpm i
```

## 5. Cấu hình Biến Môi trường

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị phù hợp cho môi trường phát triển. Liên hệ maintainers nếu cần credential hoặc giá trị mẫu.

Xem chi tiết biến môi trường tại [Biến môi trường](./environment-variables.md).

## 6. Chạy Dev Server

```bash
pnpm dev
```

Truy cập **http://localhost:3000** để verify. Trang login hoặc dashboard phải hiển thị được.

## 7. Docker (optional)

Nếu muốn build và chạy qua Docker:

```bash
# Build image
docker build -t app:$(git rev-parse --short=8 HEAD) .

# Chạy container
docker run --net host --name app --env-file ./.env app:$(git rev-parse --short=8 HEAD)
```

## 8. IDE Setup (khuyến nghị)

### VSCode Extensions

| Extension | Mục đích |
|-----------|----------|
| ESLint | Lint hiển thị lỗi real-time |
| Prettier | Auto format on save |
| Tailwind CSS IntelliSense | Autocomplete class names |
| TypeScript Vue Plugin (nếu dùng) | TS support |

### Settings gợi ý (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

## Scripts thường dùng

| Script | Mô tả |
|--------|-------|
| `pnpm dev` | Khởi động Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Chạy Vitest |
| `pnpm test:coverage` | Vitest + coverage report |
| `pnpm lint` | Prettier + ESLint check |
| `pnpm lint:fix` | Prettier + ESLint auto-fix |
| `pnpm storybook` | Storybook dev server (port 6006) |

## Lỗi thường gặp

### `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`
Lỗi SSL khi cài packages qua registry nội bộ — xử lý theo hướng dẫn maintainers (chứng chỉ, proxy, hoặc tạm `strict-ssl` nếu policy cho phép).

### `ERR_PNPM_UNSUPPORTED_ENGINE`
Version pnpm không khớp với `packageManager` trong `package.json`:
```bash
npm i -g pnpm@10
```

### Git: remote self-hosted hoặc chứng chỉ nội bộ

Khi clone/fetch qua Git server nội bộ gặp lỗi chứng chỉ, xử lý theo policy team (cài CA, hoặc tạm thời):

```bash
git config --global http.sslVerify "false"
```

:::caution
Chỉ tắt SSL verify khi policy nội bộ cho phép và bạn hiểu rủi ro.
:::

## Bước tiếp theo

Sau khi setup thành công, đọc [Onboarding checklist](./onboarding.md) để đi theo lộ trình chuẩn cho người mới.
