---
sidebar_position: 1
title: Git Flow
description: Quy trình Git, branch naming, commit message, và code review
---

# Git Flow

## Chuẩn versioning thống nhất (SSOT)

Trang này là **SSOT** cho quy ước quản lý version code (nhánh, commit, MR).

- Luồng mặc định: `feat/fix/refactor/docs/chore/style/test/build/ci/perf` đi trực tiếp từ nhánh tích hợp team quy định.
- Luồng nâng cao nhiều tầng vẫn có thể áp dụng, nhưng nhánh đưa vào CI mặc định phải đi qua validator branch hiện tại (`<type>/<lowercase-kebab-desc>`) trừ khi team chủ động mở rộng rule.

Chuẩn cần giữ đồng bộ ở mọi luồng:

| Hạng mục | Quy ước thống nhất |
|------|---------|
| Branch | `<type>/<lowercase-kebab-desc>` |
| Commit | `<type>: <description>` |
| MR title | `type(scope): mô tả ngắn` (scope có thể bỏ), `feat/fix` bắt buộc có suffix ticket `[ABC-123]` |
| Liên kết issue | Dùng `Closes #id` / `Refs #id` trong mô tả MR |

## Hai mức phân nhánh

- **Mặc định (đa số công việc):** nhánh kiểu `feat/…`, `fix/…` tách từ `main` (hoặc nhánh phát triển team quy định) — bảng dưới đây.
- **Nhiều tuyến lớn / đối tác:** có thể tách nhiều nhánh theo nhu cầu vận hành, nhưng tên nhánh vẫn phải khớp validator mặc định; xem [Đối tác, nhánh nâng cao & bundle nghiệm thu](../delivery/partner-delivery.md).

## Branch Naming (mặc định)

Validator thực thi qua `tools/gitflow/validate-rules.mjs` với pattern:

```text
<type>/<description-lowercase-kebab>
```

Allowed type: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`, `build`, `ci`, `perf`.

Mô tả nhánh chỉ nhận ký tự `a-z`, `0-9`, `-`.

Ví dụ hợp lệ:

```
feat/dbaas-backup-scheduling
fix/cc-310-breadcrumb-nested-routes
chore/update-eslint-config
```

| Type | Khi nào | Ví dụ |
|------|---------|-------|
| `feat/` | Feature mới | `feat/dbaas-backup-scheduling` |
| `fix/` | Sửa bug | `fix/breadcrumb-nested-routes` |
| `refactor/` | Refactor code | `refactor/kms-migrate-to-v6` |
| `docs/` | Cập nhật docs | `docs/update-module-anatomy` |
| `chore/` | Tooling/config | `chore/update-eslint-config` |
| `style/` | Chỉnh style/format | `style/format-import-order` |
| `test/` | Thêm/sửa test | `test/add-dbaas-validator-cases` |
| `build/` | Build pipeline/toolchain | `build/update-next-build-flags` |
| `ci/` | CI config | `ci/update-jenkins-lint-step` |
| `perf/` | Tối ưu hiệu năng | `perf/optimize-table-render` |

## Commit Message

Validator commit hiện tại dùng format tối giản:

```
<type>: <mô tả ngắn>
```

```
feat: add instance create form with zod validation
fix: resolve sidebar not collapsing on mobile
refactor: migrate kms helpers to _lib
docs: update module anatomy guide
```

Allowed type giống branch (`feat|fix|refactor|docs|chore|style|test|build|ci|perf`).

Ngoài ra, validator cho phép 2 dạng commit đặc biệt của Git:

- `Merge ...`
- `Revert ...`

Ghi chú: nếu cần body/footer để truy vết (`Refs: #123`), validator chỉ kiểm tra **dòng subject đầu tiên**.

## Auto Validation

Các rule trên đang được enforce tự động ở nhiều điểm:

1. Local `commit-msg` hook: `.husky/commit-msg` -> `node tools/gitflow/validate-rules.mjs commit-msg "$1"`.
2. Local `pre-push` hook: `.husky/pre-push` -> `node tools/gitflow/validate-rules.mjs branch`.
3. Jenkins MR pipeline: `.jenkins/Push-In-MR.yml` chạy `branch`, `commit-head`, `mr-title`.

Branch bảo vệ `main`, `master`, `dev` được skip check branch naming.

## Merge Request Title

Validator MR title nhận pattern:

```
type(scope): mô tả ngắn
type: mô tả ngắn
type(scope)!: mô tả ngắn
```

Có thể dùng tiền tố `Draft:`/`WIP:`/`[WIP]:`.

Với `feat` hoặc `fix`, bắt buộc thêm suffix ticket ở cuối title:

```text
[ABC-123]
hoặc
[ABC-123, XYZ-456]
```

## Merge Request Process

### 1. Tạo MR

- Tạo branch từ `main` (hoặc nhánh phát triển mà team quy định)
- Push và mở Merge Request trên remote Git
- Điền mô tả đầy đủ theo template mặc định của remote Git trong repo (`.github/pull_request_template.md` hoặc `.gitlab/merge_request_templates/default.md`)
- Đặt tiêu đề MR theo validator: `type(scope): mô tả ngắn` (scope có thể bỏ); với `feat/fix` thêm suffix ticket cuối title như `[ABC-123]`
- Gắn issue/ticket đúng quy ước (tiêu đề dạng `[Mã] - Mô tả`, footer `Closes #id` nếu tracker hỗ trợ) — xem [Planning & theo dõi](../delivery/planning-and-tracking.md)

### 2. MR Checklist {#mr-checklist}

```markdown
- [ ] My code follows the style guidelines of this project.
- [ ] I have performed a self-review of my code.
- [ ] I have run `pnpm build`.
- [ ] I have added a feature flag for the new feature.
- [ ] Tài liệu liên quan đã được cập nhật (nếu thay đổi kiến trúc/API/quy trình).
```

Quy ước **feature flag cho module / tính năng mới** (master env + `config.ts`, `gen:module` mặc định): xem [Module playbook](../guidelines/module-playbook.md#playbook-modular-service).

### 3. Code Review

- Ít nhất **1 approval** từ thành viên team (theo quy ước nội bộ)
- CI pipeline phải pass (lint + test + build)
- Reviewer kiểm tra:
  - Đúng cấu trúc module v6? (xem [Module Anatomy](../architecture/module-anatomy.md))
  - Không cross-module imports?
  - Có test cho logic mới?
  - Tính năng/module mới lộ ra người dùng: đã có **feature flag** master hoặc MR nêu rõ ngoại lệ — [Module playbook](../guidelines/module-playbook.md#playbook-modular-service)

Chi tiết góc nhìn author/reviewer: [Code review](./code-review.md).

Thảo luận kỹ thuật dài hoặc quyết định chốt nên nằm trên **issue/MR/ADR**, không chỉ chat — xem [Giao tiếp & ánh xạ công cụ](../delivery/communication.md).

### 4. Merge

- Squash merge (1 commit per MR) — khuyến nghị
- Delete branch sau merge

## Cộng tác viên bên ngoài core team

1. Clone repo (quyền truy cập do maintainers cấp)
2. Tạo branch theo naming convention
3. Code theo chuẩn (xem [Coding Standards](../guidelines/coding-standards.md))
4. Push và mở MR; chỉ định reviewer theo quy trình team
5. Sửa theo feedback
6. Merge sau khi approve (thường do maintainers hoặc người được quyền merge)
