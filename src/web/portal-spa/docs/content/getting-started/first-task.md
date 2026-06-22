---
sidebar_position: 4
title: First task walkthrough
description: Lộ trình thực hiện task đầu tiên và mở MR trong 60-120 phút
---

# First task walkthrough

Mục tiêu của trang này là giúp developer mới hoàn thành task đầu tiên theo chuẩn dự án mà không bị lạc hướng.

## Chọn task phù hợp

Ưu tiên task nhỏ, ít rủi ro:

- cập nhật docs
- sửa text nhỏ
- fix UI nhẹ trong module đã rõ context
- bổ sung test cho helper/validator

Tránh bắt đầu bằng task kiến trúc lớn hoặc task cần thay đổi cross-module.

## Lộ trình 60-120 phút

1. **10 phút**: đọc ticket, xác nhận phạm vi và expected output.
2. **15 phút**: định vị code bằng [How to find code](../handbook/how-to-find-code.md).
3. **20-60 phút**: triển khai thay đổi nhỏ theo chuẩn module DBaaS.
4. **10 phút**: chạy `pnpm lint` và `pnpm test` (hoặc test scope phù hợp).
5. **10 phút**: mở MR theo template mặc định của remote Git (GitHub/GitLab) trong repo.

## Checklist trước khi mở MR

- [ ] Không copy pattern legacy (`_utils`, import `src/api/{module}`)
- [ ] Đổi code tối thiểu đủ giải quyết ticket
- [ ] Có test hoặc lý do rõ nếu không cần test
- [ ] MR mô tả rõ phạm vi, rủi ro, cách verify

## Nếu bị kẹt

- Quay lại [Cài đặt môi trường](./setup.md) để kiểm tra lại checklist local
- Dùng [How to find code](../handbook/how-to-find-code.md) để khoanh vùng lỗi nhanh
- Hỏi maintainer kèm command đã chạy và log lỗi đầu tiên

## Bước tiếp theo

Sau MR đầu tiên, tiếp tục với:

1. [Module playbook](../guidelines/module-playbook.md)
2. [Code review](../workflow/code-review.md)
3. [Planning & theo dõi](../delivery/planning-and-tracking.md)