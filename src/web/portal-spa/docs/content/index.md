---
slug: /
sidebar_position: 0
title: Trang chủ
description: Tài liệu kỹ thuật dự án — điểm vào cho developer và đối tác
---

# Tài liệu kỹ thuật

Chào mừng đến **Developer Guide** và tài liệu kiến trúc dự án. Đây là điểm vào khi bạn mở site; nội dung chi tiết nằm trong sidebar.

## Getting Started

**Người mới:** bắt đầu tại [Getting Started — lộ trình đầy đủ](./getting-started/index.md) (môi trường → kiến trúc → MR đầu tiên, bảng link và thứ tự đọc SSOT).

| Mục | Mô tả |
|-----|--------|
| [Getting Started — lộ trình đầy đủ](./getting-started/index.md) | Thứ tự đề xuất, link Setup / Onboarding / First task |
| [Handbook — Tổng quan](./handbook/overview.md) | Sau khi quen flow: SSOT hành vi dev, Storybook, playbook |

Chi tiết onboarding (checklist, phase): xem trực tiếp [Onboarding checklist](./getting-started/onboarding.md) từ hub trên.

## Build Features

- [Tổng quan kiến trúc](./architecture/overview.md) — Common layer + Feature Slices
- [Giải phẫu module chuẩn (DBaaS)](./architecture/module-anatomy.md)
- [Migration status](./architecture/migration-status.md) — legacy vs module đã chuẩn
- [How to find code](./handbook/how-to-find-code.md) — định vị nhanh module, component, API, schema

## Operate & Contribute

- [Coding standards](./guidelines/coding-standards.md) · [API integration](./guidelines/api-integration.md) · [Testing](./workflow/testing.md)
- [Git flow](./workflow/git-flow.md) · [Code review](./workflow/code-review.md)

Logo và palette trên site docs có thể tuỳ chỉnh tại `public/miniLogo.svg` và token màu trong `src/styles/globals.css`.
