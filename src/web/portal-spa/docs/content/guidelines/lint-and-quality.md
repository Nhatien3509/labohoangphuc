---
sidebar_position: 2
title: Lint & code quality
description: ESLint, Prettier, typecheck, SonarLint và quy trình bổ sung rule
---

# Lint & code quality

Trang này mô tả **công cụ và quy trình** đảm bảo chất lượng code. Quy ước đặt tên, import, cấu trúc module nằm trong [Coding Standards](./coding-standards.md).

## Nguồn chuẩn (source of truth)

| Thành phần | Vai trò |
|------------|---------|
| **`pnpm lint`** | Lệnh bắt buộc pass trước merge (cùng test/build theo [CI/CD](../workflow/ci-cd.md)): chạy **Prettier check** rồi **ESLint** trên repo. |
| **`eslint.config.mjs`** | Cấu hình ESLint flat — đây là bản ghi **rule đã thống nhất** trong code review. |
| **`tools/lint/eslint/*`** | Tách riêng phần policy lint (`base-rules`, `ignores`) để dễ review và mở rộng theo domain. |
| **TypeScript** | `tsconfig.json` (strict); typecheck có thể chạy riêng (`pnpm exec tsc --noEmit`) — bổ sung cho ESLint, không thay thế. |

Quy ước viết code (naming, import cấm, v.v.) được **phản ánh tối đa** trong ESLint/TS; phần còn lại là convention và review.

## Prettier + ESLint

- **`pnpm lint`**: `prettier --check` toàn repo, sau đó `eslint --cache .`.
- **`pnpm lint:fix`**: format Prettier + ESLint auto-fix khi có.
- **`eslint-config-prettier`**: tắt rule ESLint xung đột với Prettier để tránh hai nguồn format.

Cấu hình ESLint (tóm tắt):

- `@eslint/js` recommended
- `typescript-eslint`: **strictTypeChecked** + **stylisticTypeChecked**
- `eslint-plugin-storybook` (khuyến nghị cho file Storybook)
- Override riêng cho `.storybook` (một số rule nới lỏng ở mức `warn`)

File ignore toàn cục: xem khối `ignores` trong `eslint.config.mjs` tại root repo (ví dụ có thể loại `docs/site/**`, `.agents/**` khỏi ESLint).

## Tổ chức config lint (khuyến nghị)

- Giữ `eslint.config.mjs` như entrypoint và nơi khai báo thứ tự merge config.
- Đưa rule/ignore dùng chung sang `tools/lint/eslint/` để dễ bảo trì:
	- `base-rules.mjs`: rule policy toàn repo.
	- `ignores.mjs`: ignore thống nhất cho lint.
- Override theo ngữ cảnh (ví dụ Storybook, file đặc thù) giữ trong entrypoint hoặc tách module riêng khi số lượng override tăng.
- Khi thêm policy mới: cập nhật module tương ứng + cập nhật trang docs này nếu ảnh hưởng quy ước team.

### Một số rule đáng chú ý

- `@typescript-eslint/consistent-type-imports` — inline type imports (khớp [Coding Standards](./coding-standards.md)).
- `@typescript-eslint/no-unused-vars` — không dùng biến thừa (cho phép prefix `_`).
- `no-duplicate-imports` — không trùng import.
- `@typescript-eslint/require-await` — async không rỗng (theo cấu hình hiện tại).

## TypeScript (typecheck)

ESLint + TypeScript parser bắt nhiều lỗi nhưng **không thay** toàn bộ `tsc`. Pipeline thường gồm `tsc --noEmit` (xem [CI/CD](../workflow/ci-cd.md)). Khi refactor lớn, chạy typecheck local trước khi push.

## SonarLint (IDE)

- **Vai trò:** gợi ý trên máy dev (duplicate code, smell, security gợi ý) — **bổ sung**, không phải gate merge trừ khi team gắn thêm **SonarQube / SonarCloud** trên CI và quy định riêng.
- **Cài đặt:** extension SonarLint cho editor team dùng; nếu có quality profile nội bộ, kết nối theo hướng dẫn maintainers.
- **Khi SonarLint và ESLint khác nhau:** ưu tiên kết quả **`pnpm lint`** (đã merge trong `eslint.config.mjs`). Cảnh báo SonarLint chỉ là gợi ý cho đến khi rule tương ứng được đưa vào ESLint hoặc policy team.

## SonarQube / SonarCloud (nếu team bật trên CI)

Nếu sau này pipeline chạy phân tích Sonar server:

- Ghi rõ trong [CI/CD](../workflow/ci-cd.md): stage nào, có **quality gate** chặn merge không.
- Thứ tự ưu tiên: **ESLint + test + build** là tối thiểu; Sonar bổ sung metric — tránh hai nguồn cùng một rule trừ khi đã đồng bộ.

## Bổ sung hoặc sửa rule (ESLint / custom)

1. **Chỉnh `eslint.config.mjs`** (hoặc plugin nội bộ nếu có) trong MR riêng hoặc cùng feature — **nhỏ, dễ review**.
2. **Cập nhật docs:** thêm hoặc sửa mục “Một số rule đáng chú ý” ở trang này nếu rule mới mang tính **chính sách team** (không cần liệt kê hết mọi rule).
3. **`pnpm lint` / `pnpm lint:fix`** phải chạy xanh trên toàn repo sau khi thêm rule (hoặc có `eslint-disable` có lý do ghi trong comment).

## Pre-commit (tuỳ chọn)

Repo có thể chạy Husky + lint-staged cho vòng pre-commit. Với cấu hình hiện tại, lint-staged chỉ chạy trên **file staged** để giảm thời gian chờ:

- JS/TS: ESLint `--fix --max-warnings=0` rồi Prettier `--write`.
- JSON/Markdown/YAML/CSS: Prettier `--write`.

Pre-commit vẫn **không thay** việc chạy `pnpm lint` đầy đủ trước merge.

## Tóm tắt nhanh

| Công cụ | Chạy ở đâu | Bắt buộc trước merge |
|---------|------------|----------------------|
| Prettier + ESLint (`pnpm lint`) | Local, CI | Có (theo pipeline) |
| `tsc --noEmit` | Local, CI | Khuyến nghị / theo CI |
| SonarLint | IDE | Không (gợi ý) |
| SonarQube/Cloud | CI (nếu có) | Theo quy định team |
