---
sidebar_position: 2
title: Onboarding Checklist
description: Checklist cho developer mới tham gia dự án
---

# Onboarding Checklist

Checklist cho developer mới tham gia dự án. **Thứ tự đọc tổng thể và bảng link** (SSOT): [Getting Started — lộ trình tổng quan](./index.md).

## Lộ trình đề xuất (bắt buộc theo thứ tự)

| Phase | Thời gian | Kết quả đầu ra |
|-------|-----------|----------------|
| 1. Môi trường | 30-45 phút | Chạy được `pnpm dev`, `pnpm test` |
| 2. Nắm bản đồ dự án | 60-90 phút | Hiểu Common + Feature Slice, biết DBaaS là reference |
| 3. Quy trình chất lượng | 45 phút | Nắm lint/test/git flow/code review |
| 4. MR đầu tiên | 30 phút | Tạo branch, mở MR theo template |

## Quy tắc vàng

:::important
**Mọi code mới phải theo cấu trúc module DBaaS.**

DBaaS đã được migrate hoàn chỉnh và là reference implementation cho toàn bộ dự án. Khi bạn thấy các module khác (ví dụ: `cloud-server`, `block-storage`) có cấu trúc khác (dùng `_utils/`, `_actions/`, API nằm ở `src/api/`), đó là **code legacy** — không nên copy theo.

Xem chi tiết tại [Giải phẫu Module Chuẩn](../architecture/module-anatomy.md).
:::

## Phase 1: Môi trường (30-45 phút)

- [ ] **Hoàn thành cài đặt môi trường** → xem [Cài đặt Môi trường](./setup.md)
- [ ] Chạy `pnpm dev` thành công, truy cập `localhost:3000`
- [ ] Chạy `pnpm test` thành công
- [ ] Chạy `pnpm storybook` để xem thư viện component
- [ ] Đọc nhanh [Biến môi trường](./environment-variables.md)

## Phase 2: Nắm bản đồ dự án (60-90 phút)

- [ ] Đọc [Handbook — Tổng quan](../handbook/overview.md) — SSOT khi Storybook chưa phủ hết; lộ trình đọc tài liệu
- [ ] Lưu [References — Stack & Figma](../handbook/references.md) để tra link thiết kế và stack nhanh
- [ ] Đọc [Tổng quan Kiến trúc](../architecture/overview.md) — hiểu 2 lớp: Common + Feature Slices
- [ ] Đọc [Giải phẫu Module Chuẩn (DBaaS)](../architecture/module-anatomy.md)
- [ ] Mở folder `src/app/[locale]/dbaas/` trong editor, đối chiếu với tài liệu
- [ ] Đọc [Migration Status](../architecture/migration-status.md) — biết module nào legacy, module nào đã chuẩn

## Phase 3: Quy trình & chất lượng (45 phút)

- [ ] Đọc [Coding Standards](../guidelines/coding-standards.md)
- [ ] Đọc [Lint & code quality](../guidelines/lint-and-quality.md) (ESLint, Prettier, SonarLint)
- [ ] Đọc [Patterns thường gặp](../guidelines/common-patterns.md) (tham khảo nhanh)
- [ ] Đọc [Git Flow](../workflow/git-flow.md)
- [ ] Đọc [Testing](../workflow/testing.md)
- [ ] Đọc [Code review](../workflow/code-review.md)
- [ ] Đọc [Planning & theo dõi](../delivery/planning-and-tracking.md) (issue, milestone, liên kết MR)
- [ ] Đọc [Giao tiếp & ánh xạ công cụ](../delivery/communication.md) (Git / Figma / chat)
- [ ] Nếu làm việc theo tuyến đối tác / epic lớn: [Đối tác & bundle](../delivery/partner-delivery.md)

## Phase 4: MR đầu tiên (30 phút)

- [ ] Tạo branch theo naming convention
- [ ] Code theo **cấu trúc module DBaaS** (không theo legacy modules)
- [ ] Mở Merge Request đầu tiên theo template mặc định của remote Git (GitHub/GitLab) trong repo
- [ ] Nhận review và merge
- [ ] Thực hành theo [First task walkthrough](./first-task.md)

## Kênh hỗ trợ

- **Code review**: Merge Request trên remote Git của team; chỉ định reviewer theo quy ước nội bộ
- **Câu hỏi kiến trúc / kỹ thuật**: kênh hoặc nhóm maintainers do team quy định
- **Bug / issue**: tạo ticket trên hệ thống tracking của team

## Quick Links

| Tài liệu | Nội dung |
|-----------|----------|
| [Handbook](../handbook/overview.md) | Developer Guide, Figma & stack |
| [Setup](./setup.md) | Cài đặt môi trường |
| [Environment variables](./environment-variables.md) | Biến môi trường cần có và cách kiểm tra |
| [First task walkthrough](./first-task.md) | Lộ trình thực thi task đầu tiên |
| [Kiến trúc](../architecture/overview.md) | Bản đồ kiến trúc tổng quan |
| [Module Anatomy](../architecture/module-anatomy.md) | Cấu trúc module chuẩn |
| [Coding Standards](../guidelines/coding-standards.md) | Quy tắc viết code |
| [Lint & code quality](../guidelines/lint-and-quality.md) | ESLint, Prettier, SonarLint |
| [API Integration](../guidelines/api-integration.md) | Cách viết API layer |
| [Git Flow](../workflow/git-flow.md) | Quy trình Git |
| [Planning & theo dõi](../delivery/planning-and-tracking.md) | Issue, milestone, nhãn |
| [Giao tiếp & ánh xạ](../delivery/communication.md) | Kênh Git, thiết kế, chat |
| [Đối tác & bundle](../delivery/partner-delivery.md) | Nhánh dev/feature/task, vendor |
