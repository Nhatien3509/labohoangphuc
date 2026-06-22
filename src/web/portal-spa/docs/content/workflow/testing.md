---
sidebar_position: 4
title: Testing
description: Chiến lược coverage theo giai đoạn, Vitest, cấu trúc test và best practices
---

# Testing

## Chiến lược coverage (theo giai đoạn)

Nền test hiện tại chưa đồng đều; team áp dụng **lộ trình ba phase** để tăng chất lượng có kiểm soát, tránh đòi hỏi “100% toàn repo” ngay từ đầu nhưng vẫn **siết chặt dần** phần code mới.

| Phase | Phạm vi bắt buộc | Mục tiêu |
|-------|------------------|----------|
| **1** | **Code logic mới** | Mọi logic mới (thêm hoặc thay thế có ý nghĩa) phải có **test coverage đầy đủ** trên phạm vi đó. |
| **2** | Phase 1 + **component React mới** | Thêm bắt buộc test (ví dụ Testing Library) cho **component/UI mới** hoặc **thay đổi lớn** trên component — coverage đầy đủ như phase 1. |
| **3** | **Toàn bộ source** trong phạm vi dự án | Mở rộng chuẩn coverage sang legacy và code cũ; có thể gắn **ngưỡng CI** (tổng hoặc theo module) sau khi baseline đã đo và plan backfill rõ. |

**“Code logic mới” (phase 1)** — ví dụ điển hình:

- `validators`, helpers, pure utils trong `_lib/` / `_utils` (khi chưa migrate).
- Logic trong **Zod schema** (`refine`, `superRefine`, transform).
- Hook / module có **nhánh điều kiện** hoặc side effect test được bằng unit (mock tối thiểu).

**“Component mới” (phase 2)** — file `*.tsx` (hoặc tách logic ra khỏi view vẫn phải cover phần logic theo phase 1). Không coi Storybook là thay thế unit test trừ khi team có quy ước riêng.

**“100% coverage”** trong bảng trên hiểu là: đối với **file hoặc khối code thuộc phạm vi phase hiện hành**, các nhánh và dòng có nghĩa (không tính dead code cố ý, re-export thuần) phải được cover; reviewer có thể đối chiếu `pnpm test:coverage` hoặc báo cáo CI. Team đang ở **phase nào** nên ghi rõ trong handbook nội bộ hoặc channel dự án và cập nhật khi chuyển phase.

:::note
Phase 3 thường cần **đo baseline**, **ưu tiên module rủi ro cao**, rồi mới siết ngưỡng toàn repo — tránh một lần “bật 80% global” làm tắc pipeline.
:::

:::info Phase hiện tại (cập nhật khi team đổi)
**Ghi nhận trong repo: Phase 1** — mọi **logic mới** (validators, helpers, schema Zod có nhánh) cần test đầy đủ; **component/UI mới** chưa bắt buộc Testing Library cho đến khi team thông báo chuyển **Phase 2**. Khi chính thức đổi phase, sửa khối này và/hoặc thông báo trên channel dự án.
:::

## Stack

| Tool | Vai trò |
|------|---------|
| **Vitest** | Test runner |
| **@testing-library/react** | React component testing |
| **jsdom** | Browser environment cho tests |
| **@vitest/coverage-v8** | Coverage reporting |

## Chạy Tests

```bash
# Chạy tất cả tests
pnpm test

# Chạy với coverage
pnpm test:coverage

# Chạy tests cho 1 module
pnpm exec vitest run src/app/\[locale\]/dbaas

# Watch mode (development)
pnpm exec vitest src/app/\[locale\]/dbaas
```

## Test File Location

Project hỗ trợ 2 cách đặt file test:

### 1. Colocated (khuyến nghị cho module v6)

Đặt test cạnh source file:

```
_lib/
├── validators.ts
├── validators.test.ts     ← cạnh source
├── helpers.ts
└── helpers.test.ts        ← cạnh source
```

### 2. `__tests__/` (legacy pattern)

Một số tests cũ nằm trong `__tests__/` ở root:

```
__tests__/
└── app/
    └── [locale]/
        └── dbaas/         ← mirror cấu trúc src
```

:::tip
Khi viết test mới cho module v6, **ưu tiên colocated** (cạnh source file).
:::

## Ví dụ Test

### Test Validators

```typescript
// _lib/validators.test.ts
import { describe, it, expect } from "vitest";
import { isValidRootPassword, BACKUP_NAME_REGEX } from "./validators";

describe("isValidRootPassword", () => {
  it("accepts password with mixed case, number, and special char", () => {
    expect(isValidRootPassword("Abcdef1!")).toBe(true);
  });

  it("rejects password without uppercase", () => {
    expect(isValidRootPassword("abcdef1!")).toBe(false);
  });

  it("rejects password with @", () => {
    expect(isValidRootPassword("Abcdef1@")).toBe(false);
  });
});

describe("BACKUP_NAME_REGEX", () => {
  it("accepts valid backup name", () => {
    expect(BACKUP_NAME_REGEX.test("my-backup_01")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(BACKUP_NAME_REGEX.test("")).toBe(false);
  });
});
```

### Test Helpers

```typescript
// _lib/helpers.test.ts
import { describe, it, expect } from "vitest";
import { isVersionGte } from "./helpers";

describe("isVersionGte", () => {
  it("returns true when v1 >= v2", () => {
    expect(isVersionGte({ v1: "8.0.1", v2: "6.0.0" })).toBe(true);
  });

  it("returns false when v1 < v2", () => {
    expect(isVersionGte({ v1: "5.7.0", v2: "6.0.0" })).toBe(false);
  });
});
```

## Quy tắc (theo phase đang áp dụng)

- **Phase 1+:** Test **validators**, **helpers**, và **schema** có logic (refine, superRefine) là bắt buộc cho code mới trong phạm vi đó.
- **Phase 2+:** Mọi **component mới** (hoặc refactor lớn component) cần test tương ứng; ưu tiên hành vi và điều kiện, không cố cover từng pixel markup tầm thường.
- **Phase 3:** Bổ sung / duy trì test cho code legacy theo kế hoạch backfill và ngưỡng đã thống nhất.
- Tránh test chỉ để “đạt số” — mỗi case nên gắn với hành vi hoặc bug class có rủi ro.

## Checklist test trước MR

- [ ] Chạy `pnpm test` hoặc test scope phù hợp với thay đổi
- [ ] Đối chiếu **phase coverage** hiện tại của team: logic mới (và component mới nếu đã phase 2) đạt chuẩn đã thống nhất
- [ ] Có test regression cho bug quan trọng
- [ ] Test mới đặt cạnh source file nếu là module v6
- [ ] Không làm vỡ test cũ ở module liên quan

## Bước tiếp theo

1. Đọc [Code review](./code-review.md) để hoàn thiện checklist mở MR.
2. Nếu là task đầu tiên, đi theo [First task walkthrough](../getting-started/first-task.md).
