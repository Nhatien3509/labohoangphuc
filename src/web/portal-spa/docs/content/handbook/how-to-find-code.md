---
sidebar_position: 4
title: How to find code
description: Cách định vị nhanh module, component, API, schema và tests
---

# How to find code

Trang này trả lời câu hỏi thường gặp của người mới: "Mình cần sửa ở đâu?"

## 1. Tìm feature/module

- Module chuẩn nằm trong `src/app/[locale]/{module}/`
- Module tham chiếu ưu tiên: `src/app/[locale]/dbaas/`

Ví dụ:

- màn danh sách instance DBaaS: `src/app/[locale]/dbaas/instances/page.tsx`
- API DBaaS: `src/app/[locale]/dbaas/_apis/`

## 2. Tìm shared UI component

- Primitive: `src/common/components/ui/`
- Container: `src/common/components/containers/`
- Layout shell: `src/common/components/layout/`

Nếu chưa có story tương ứng, đọc [Component usage](./component-usage.md).

## 3. Tìm business logic và validation

- Const/helpers/validators của module: `src/app/[locale]/{module}/_lib/`
- Zod schemas theo route: `src/app/[locale]/{module}/{route}/_components/schemas.ts`

Nguyên tắc:

- regex/predicate nằm trong `validators.ts`
- schema form nằm cạnh route, không dồn vào `_lib/`

## 4. Tìm API call

- Read APIs: `{module}/_apis/server.ts`
- Mutations: `{module}/_apis/server.actions.ts`
- Types/tags: `{module}/_apis/types.ts`
- URN permissions: `{module}/_apis/urns.ts`

Tránh dùng module legacy ở `src/api/{module}/` làm mẫu cho code mới.

## 5. Tìm tests

- Ưu tiên colocated test cạnh source file (`*.test.ts`)
- Legacy tests vẫn có trong `__tests__/`

Xem thêm [Testing](../workflow/testing.md).

## Bước tiếp theo

1. [Module playbook](../guidelines/module-playbook.md)
2. [Module anatomy](../architecture/module-anatomy.md)