---
sidebar_position: 1
title: Agent skills trong repo
description: Vị trí SKILL.md trong .agents/skills, CLI dự án, và cách duy trì
---

# Agent skills trong repo

Thư mục **`.agents/skills/<tên-skill>/SKILL.md`** chứa hướng dẫn ngắn cho **coding agent / AI assistant** (bất kỳ sản phẩm nào có thể nạp file skill hoặc neo context từ repo) khi implement/refactor theo convention dự án. Các file này được **track trong git** (ngoại lệ trong `.gitignore`: `!.agents/skills/**/SKILL.md`).

Đây **không** thay thế [`docs/architecture/`](../architecture/overview.md) hay guideline — khi mâu thuẫn, **docs + code** là nguồn đúng; cập nhật `SKILL.md` hoặc ghi *deprecated* trong skill.

## CLI dự án

Lệnh build/test/lint/storybook dùng **pnpm** khai báo trong `package.json` — chạy trên terminal hoặc CI; xem bảng tóm tắt trong [References — CLI dự án & agent skills](../handbook/references.md#repo-cli).

## Vị trí trong repo

| Thành phần | Đường dẫn |
|------------|-----------|
| Định nghĩa skill | `.agents/skills/<tên-skill>/SKILL.md` |
| Script hỗ trợ (nếu có) | `.agents/skills/<tên-skill>/scripts/` |

## Danh sách skill trong repo {#repo-agent-skills}

Các skill sau **đang có trong repository** (cập nhật bảng khi thêm/xóa skill):

| Skill | Vai trò tóm tắt |
|-------|-----------------|
| `page-gen` | `page.tsx`: `withPage`, re-export, async server page. |
| `api-integration` | Server-first, URN, loading/error, hạn chế `Promise.all` không cần thiết. |
| `responsive` | Layout không vỡ viewport hẹp; flex/scroll bảng; chưa cần fit pixel-perfect mọi breakpoint. |
| `global-impact` | CMP: allowed actions/billing/cost estimate khi thêm dịch vụ. |
| `react-composition` | Tách Server/Client, props, state, `useEffect` có chủ đích. |
| `implement-from-srs` | SRS markdown + Figma/screenshot → kế hoạch triển khai và code theo anatomy/API; ghi rõ blocker khi spec thiếu. |

## Cách dùng

1. Đọc guideline liên quan (kiến trúc, API, state) trước khi chỉ dựa vào skill.
2. Mở đúng `SKILL.md` theo việc cần làm; làm theo checklist trong file.
3. Công cụ agent của bạn có thể đăng ký thư mục skill hoặc trỏ thẳng file — tùy sản phẩm, không bắt buộc một IDE cụ thể.
4. Nếu có script sửa hàng loạt file: chạy trên nhánh sạch, review diff kỹ.

## Phát triển và duy trì

- Thay đổi convention mà skill đề cập → cập nhật `SKILL.md` trong cùng giai đoạn hoặc ghi *superseded by …*.
- **Tuỳ chọn:** dòng **Last verified** (ngày/tag) ở đầu skill.
- ESLint có thể ignore `.agents/**` — skill không được “sửa” bởi lint; nội dung vẫn do người duy trì.

## Liên quan

- [References — CLI & agent skills](../handbook/references.md#repo-cli)
- [Coding standards](../guidelines/coding-standards.md)
- [Common layer](../architecture/common-layer.md)
