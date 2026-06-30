# portal-spa (FE) — Labo Hoàng Phúc

Frontend Next.js 14 (App Router) cho hệ thống **bảo hành Labo Hoàng Phúc**.
Khung được dẫn xuất từ template `portal-spa` (Hệ thống tích hợp & chia sẻ dữ liệu),
giữ lại **kiến trúc Feature Slice + tầng common + tầng api**, lược bỏ phần
auth/SSO, i18n, feature-flags, charts… vốn không cần cho domain bảo hành.

## Kiến trúc

```
src/
├── env.ts                      # đọc BACKEND_URL
├── api/                        # tầng HTTP client (chỉ chạy ở server)
│   ├── instance.ts             #   apiInstance.get/post/... -> FetchResult, unwrap envelope BE
│   ├── types.ts                #   ReqInit, FetchResult, ApiEnvelope { success, data, error }
│   └── common/types.ts
├── common/                     # phần DÙNG CHUNG — kiểm tra ở đây trước khi viết mới
│   ├── lib/{core/utils, helpers/*}
│   ├── hooks/useQueryParams.ts # state filter/pagination dựa trên URL searchParams
│   └── components/{ui, layout}  # UI primitives (shadcn) + sidebar/header/theme
└── app/
    ├── layout.tsx              # root: ThemeProvider + Toaster
    ├── (public)/               # khung khách vãng lai
    │   └── tra-cuu/            ★ FEATURE MẪU (tra cứu công khai theo mã)
    └── (dashboard)/            # khung admin (sidebar + header)
        └── admin/warranty-cards/ ★ FEATURE MẪU (list + tạo thẻ, Feature Slice)
```

### Feature Slice

Mỗi feature tự sở hữu các thư mục con (theo template gốc):

```
<feature>/
├── page.tsx          # Server Component "vỏ mỏng": fetch dữ liệu, lắp ráp _components
├── _apis/            # server.ts (GET), actions.ts ("use server"), types.ts
├── _components/      # UI; Client Component cho phần tương tác
└── _lib/             # const, zod schema, helper riêng của feature
```

Quy ước (kế thừa từ portal-spa):

- **Server Components fetch dữ liệu**; Client Components render UI + sở hữu state qua URL.
- Page là vỏ mỏng — UI nằm trong `_components/`.
- Không import chéo giữa các feature; dùng `@common/*` cho phần dùng chung.
- Mọi class `bg-*`/`text-*` phải đi kèm biến thể `dark:*`.
- Trước khi viết component/util mới: **kiểm tra `src/common/` trước**.

### Path alias

- `@/*`      → `src/*`
- `@common/*` → `src/common/*`

## Kết nối backend

Backend Go `labo-warranty` (xem `../../labo-warranty`) chạy mặc định cổng 8080,
base path `/api/v1`. Đặt URL gốc trong `.env.local`:

```
BACKEND_URL=http://localhost:8080
```

Endpoint đang dùng:

| FE | Backend | Auth |
|---|---|---|
| `login` (`@common/auth/actions.ts`)    | `POST /api/v1/auth/login` | công khai |
| `middleware` tự làm mới token          | `POST /api/v1/auth/refresh` | refresh token |
| `UserMenu` đăng xuất (`@common/auth`)  | `POST /api/v1/auth/logout` | Bearer |
| `UserMenu` đổi mật khẩu (`@common/auth`) | `POST /api/v1/auth/change-password` | Bearer |
| `tra-cuu` (`_apis/server.ts`)          | `GET /api/v1/warranty/:code` | công khai |
| `warranty-cards` list (`server.ts`)    | `GET /api/v1/admin/warranty-cards?page=&limit=` | Bearer |
| `warranty-cards` check trùng mã (`actions.ts`) | `GET /api/v1/admin/check-warranty-code?code=` | Bearer |
| `warranty-cards` chi tiết              | `GET /api/v1/admin/warranty-cards/:id` | Bearer |
| `warranty-cards` create (`actions.ts`) | `POST /api/v1/admin/warranty-cards` | Bearer |
| `warranty-cards` sửa (`actions.ts`)    | `PUT /api/v1/admin/warranty-cards/:id` | Bearer |
| `warranty-cards` xoá (`actions.ts`)    | `DELETE /api/v1/admin/warranty-cards/:id` | Bearer |

### Xác thực

- Đăng nhập lưu `access_token`/`refresh_token` vào **cookie httpOnly** (`src/api/session.ts`).
- `apiInstance` gắn `Authorization: Bearer` khi gọi với tuỳ chọn `{ auth: true }`.
- `src/middleware.ts` bảo vệ `/admin/:path*`: access token còn hạn → cho qua;
  hết hạn (sống ~15 phút) nhưng còn refresh token → gọi `/auth/refresh` và ghi
  cặp token mới vào cookie; không refresh được → điều hướng về `/login`.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3600  → "/" redirect sang /tra-cuu
```

Kiểm tra trước khi commit:

```bash
npm run typecheck   # tsc --noEmit
npm run lint
```

## Thêm feature admin mới

1. Nhân bản thư mục `src/app/(dashboard)/admin/warranty-cards`.
2. Sửa `_apis` (endpoint), `_lib` (schema), `_components` (UI).
3. Thêm một mục vào `MENU` trong `src/common/components/layout/AppSidebar.tsx`.
