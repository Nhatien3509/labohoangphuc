---
sidebar_position: 1
title: Planning & theo dõi công việc
description: Quy chế issue, milestone, nhãn và liên kết với Git — SSOT cho tiến độ
---

# Planning & theo dõi công việc

Tài liệu này mô tả **quy ước trên hệ thống quản lý công việc** (issue tracker) của team, bổ sung cho [Git Flow](../workflow/git-flow.md) và [Code review](../workflow/code-review.md). Mục tiêu: một nơi thống nhất để theo dõi tiến độ, hạn chế task “hộp đen”, và minh bạch trách nhiệm — phần báo cáo tự động phụ thuộc cấu hình thực tế trên tool team đang dùng.

Cách **phối hợp và giao tiếp** giữa các vai trò (async, MR/review, đối tác): [Giao tiếp & ánh xạ công cụ](./communication.md).

## Phân rã công việc

- **Nguyên tắc ước lượng:** Task dự kiến **lớn hơn khoảng 16 giờ làm việc** (tương đương ~2 ngày tập trung) **nên** được tách thành sub-issue hoặc checklist rõ ràng, trừ khi team thống nhất ngoại lệ.
- **Tránh “hộp đen”:** Mỗi issue nên có đủ mô tả để reviewer và người làm cùng hiểu phạm vi trước khi bắt đầu.

## Trường thông tin khuyến nghị trên issue

Khi issue tracker hỗ trợ, nên điền đủ các thành tố sau (tên field có thể khác tùy công cụ):

| Thành tố | Mục đích |
|----------|----------|
| **Weight / effort** | Ước lượng độ lớn (giờ, điểm, hoặc đơn vị team thống nhất) — phục vụ lập kế hoạch sprint/milestone và velocity **khi team dùng thống nhất**. |
| **Due date** | Hạn mục tiêu — dùng cho nhắc hạn và sắp xếp ưu tiên. |
| **Checklist thực thi** | Các bước kỹ thuật nhỏ; giúp author và reviewer đồng bộ cách triển khai sớm. |

## Nhãn (labels) và phân loại

- **`Feature::[Tên]`** (hoặc quy ước tương đương): gắn issue với module/tính năng (ví dụ DBaaS, FileStorage, Network) để lọc báo cáo và board theo từng phần.
- **Priority** — gợi ý mức (điều chỉnh theo policy team):
  - **P0 (Urgent):** chặn tiến độ hoặc production — xử lý ngay.
  - **P1 (High):** ưu tiên trong milestone/sprint hiện tại.
  - **P2 (Normal):** công việc nghiệp vụ thông thường.
- **Partner / Vendor / Team** (nếu có nhiều bên): nhãn dạng `Partner::[Tên]`, `Vendor::[Tên]` hoặc `Team::[Tên]` để lọc theo đơn vị giao nhận — **chọn một quy ước** và giữ nhất quán (xem [Đối tác & bundle](./partner-delivery.md)).

## Đặt tên issue và Merge Request

- **Định dạng gợi ý:** `[Mã_Tính_Năng] - Mô tả ngắn` — giúp nhận diện nhanh trên danh sách MR và lịch sử Git.
- **Liên kết code ↔ issue:** Trong mô tả MR, dùng từ khóa tracker hỗ trợ (ví dụ `Closes #123`) để **đóng hoặc cập nhật** issue khi merge — cấu hình cụ thể phụ thuộc remote Git và issue tracker.

Chi tiết branch và commit: [Git Flow](../workflow/git-flow.md). Mẫu mô tả MR dùng template mặc định của remote Git trong repo (`.github/pull_request_template.md` hoặc `.gitlab/merge_request_templates/default.md`).

## Vòng đời trạng thái (lifecycle)

Quy ước gợi ý — map sang cột board thực tế trên tool của team:

| Trạng thái | Ý nghĩa |
|------------|---------|
| **Todo** | Đã lên kế hoạch, chưa làm. |
| **Doing** | Đang triển khai. |
| **Review** | Đang code review / MR mở. |
| **Verifying** | Đã merge (hoặc sắp merge) — chờ kiểm tra trên staging/sandbox (lead/QA/maintainers theo quy ước). |
| **Done** | Đã nghiệm thu; coi là hoàn thành cho mục đích milestone. |

**Báo cáo tiến độ:** Chỉ issue ở trạng thái **Done** (hoặc tương đương) nên được tính vào **tỷ lệ hoàn thành milestone** nếu team muốn thúc đẩy nghiệm thu cuối. Task đang **Verifying** vẫn coi là chưa đạt “xong” cho báo cáo đó.

**Definition of Done** gợi ý: merge + CI xanh + verify trên môi trường thống nhất + issue/ticket cập nhật (khớp [Code review](../workflow/code-review.md)).

## Báo cáo và bộ lọc

- **Burndown / burnup theo milestone:** Hữu ích khi issue có weight và milestone gắn deadline — đường thực tế so với kế hoạch giúp phát hiện cần thêm nguồn lực hoặc điều chỉnh phạm vi. Cần bật đủ metadata trên tracker.
- **Saved filters / board view:** Lưu bộ lọc theo **Feature::** và (nếu dùng) **Partner::** để xuất nhanh báo cáo theo tính năng hoặc theo bên phụ trách.

## Git và issue tracker — tham chiếu nhanh

| Mục đích | Gợi ý thao tác | Giá trị |
|----------|----------------|---------|
| Theo dõi hạn | Gán **due date** trên issue | Nhắc việc, sắp xếp ưu tiên theo thời gian |
| Phân tích tải / velocity | Điền **weight** thống nhất | Dự báo và cân milestone (khi team áp dụng đều) |
| Lọc theo bên / đội | Nhãn **Partner::** / **Team::** (nếu dùng) | Báo cáo theo đơn vị |
| Đồng bộ code | `Closes #id` (hoặc từ khóa tương đương) trong MR | Cập nhật issue khi merge |

## Liên quan

- [Giao tiếp & ánh xạ công cụ](./communication.md) — kênh Git / thiết kế / chat, traceability
- [Đối tác, nhánh nâng cao & bundle](./partner-delivery.md) — `dev` / `feature` / `task`, nhãn vendor, nghiệm thu bundle
- [Git Flow](../workflow/git-flow.md) — branch, MR, merge
- [Code review](../workflow/code-review.md) — checklist author/reviewer
- [CI/CD](../workflow/ci-cd.md) — gate trên pipeline
