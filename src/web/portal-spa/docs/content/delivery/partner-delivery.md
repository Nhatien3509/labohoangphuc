---

## sidebar_position: 3
title: Đối tác, nhánh nâng cao & bundle nghiệm thu
description: Phân cấp nhánh dev/feature/task, nhãn Vendor, CODEOWNERS và đóng gói nghiệm thu

# Đối tác, nhánh nâng cao & bundle nghiệm thu

Trang này mô tả **mô hình tùy chọn** khi team cần **cô lập nhiều tuyến lớn song song**, phân loại theo **đối tác / vendor**, và **nghiệm thu theo bundle**. Chuẩn quản lý version code (nhánh, commit, MR) vẫn lấy từ [Git Flow](../workflow/git-flow.md) làm SSOT.

Xem thêm: [Planning & theo dõi](./planning-and-tracking.md), [Giao tiếp](./communication.md).

## Đồng bộ với Git Flow (nhánh, commit, mã MR)

Khi vận hành nhiều tuyến song song, vẫn phải giữ quy ước tương thích validator hiện tại:


| Hạng mục      | Quy ước đồng bộ                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Branch        | `<type>/<lowercase-kebab-desc>` với type trong nhóm chuẩn (`feat/fix/refactor/docs/chore/style/test/build/ci/perf`) |
| Commit        | `<type>: <description>`                                                                                             |
| MR title      | `type(scope): mô tả ngắn` (scope có thể bỏ); `feat/fix` thêm suffix `[ABC-123]`                                     |
| Mapping issue | `Closes #id` hoặc `Refs #id` trong MR description                                                                   |


Nguyên tắc: **Delivery không tạo chuẩn commit/branch riêng**, chỉ mở rộng luồng nhánh nhiều tầng để vận hành.

## Phân cấp nhánh (sandbox hierarchy)

Mục tiêu: cô lập lỗi và cho phép nhiều epic/feature lớn chạy song song **khi team áp dụng** mô hình này. Với rule mặc định, đặt tên nhánh theo prefix type hợp lệ để không bị chặn ở pre-push/CI.


| Nhánh                                 | Vai trò                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `**main`**                            | Ổn định, gắn với phiên bản production / release — thường quản lý bằng **tag** (ví dụ `v1.2.0`).                                   |
| `**dev`** (hoặc tên tương đương)      | Nhánh **tích hợp** trung tâm: các tính năng đã review có thể hợp nhất về đây trước khi lên `main` (tuỳ quy trình merge của team). |
| `**feat/<ma-chuc-nang>-integration`** | Nhánh **tổng** cho một epic/feature lớn — tách từ `dev` (hoặc từ nhánh tích hợp team quy định).                                   |
| `**fix/refactor/chore/...`**          | Nhánh làm việc **nhỏ** — tách từ nhánh tích hợp của feature tương ứng.                                                            |


**Luồng MR gợi ý:** nhánh nhỏ (`fix/...`, `refactor/...`, ...) → nhánh tích hợp feature (`feat/...-integration`) → `dev` → `main` (điều chỉnh nếu team chỉ dùng hai cấp).

**Lưu ý release:** Project dùng **semantic-release** thường kích hoạt từ merge lên `main`. Nếu có nhánh `dev`, cần **thống nhất** khi nào merge `dev` → `main` và ai tạo tag — tránh lệch với pipeline thực tế.

## Quy ước định danh (commit & MR)

### Commit message

- Giữ commit theo validator: `type: mô tả` (type lấy từ nhóm chuẩn trong [Git Flow](../workflow/git-flow.md)).
- Có thể thêm body/footer `Refs: #id` khi cần truy vết; validator chỉ check dòng subject đầu tiên.

### Merge Request — nơi tập trung cho nghiệm thu

- **Tiêu đề MR:** `type(scope): mô tả ngắn` (scope có thể bỏ). Với `feat/fix`, bắt buộc suffix ticket ở cuối: `[ABC-123]` hoặc `[ABC-123, XYZ-456]`.
 Có thể thêm ghi chú feature flag trong tiêu đề hoặc (khuyến nghị) trong **mô tả MR** để title gọn: ví dụ `Feature flag: is_dashboard_enabled`.
- **Mô tả MR:** Dòng `Closes #ID` (hoặc từ khóa tracker hỗ trợ) để ánh xạ issue/milestone/project — xem [Planning & theo dõi](./planning-and-tracking.md).
- **Nhãn trên MR:** Gán nhãn **đối tác / vendor** (và trạng thái nếu dùng) khi tạo MR — có thể **thủ công** hoặc qua **rule/bot** nếu team cấu hình.

## Quản lý đối tác (metadata trên Git / tracker)

Thay vì “ghi tên vendor vào code”, dùng **nhãn và metadata** trên issue/MR/board:

1. **Nhãn (labels)**
  - Đối tác: ví dụ `Vendor::Partner-A` hoặc đồng bộ với `Partner::[Tên]` trong [Planning](./planning-and-tracking.md) — team chọn **một** quy ước và giữ nhất quán.  
  - Trạng thái (nếu cần): ví dụ `Status: Reviewing`, `Status: Verifying` — map với lifecycle trong Planning.
2. **Bảng / project trên issue tracker**
  Trên nền tảng hỗ trợ (board, custom field), có thể thêm field **Vendor** hoặc **Partner** và dùng **group by** để xem khối lượng và tiến độ theo từng bên trên một màn hình. Tên tính năng phụ thuộc công cụ (GitHub Projects, GitLab, v.v.).
3. **CODEOWNERS**
  File `CODEOWNERS` ở root repo dùng để **gợi ý / bắt buộc** reviewer theo đường dẫn (cú pháp và hành vi phụ thuộc remote Git — GitHub, GitLab, v.v.). Phù hợp khi từng vendor/đội sở hữu một vùng thư mục và cần reviewer phụ trách review trước khi maintainer duyệt cuối.

## Bundle nghiệm thu & báo cáo

1. **Trích xuất danh sách công việc**
  Lọc board/issue theo **Milestone** + nhãn **Vendor/Partner** (và export CSV nếu tool hỗ trợ) để có danh sách issue đã hoàn thành theo từng bên phục vụ nghiệm thu.
2. **Release / tag**
  Khi đóng milestone cho một đối tác, có thể tạo **tag phiên bản** trên nhánh ổn định (`main` hoặc theo quy ước). Trong **release notes**, lọc MR đã merge có nhãn vendor tương ứng (tuỳ khả năng của remote Git).
3. **Feature flag**
  Mọi tính năng trong bundle bàn giao nên ghi rõ **trạng thái flag** (bật/tắt) trong tài liệu nghiệm thu hoặc mô tả MR/release — khớp checklist MR trong [Git Flow](../workflow/git-flow.md).

## Quy trình vận hành gợi ý (khép kín)

1. Lead/maintainers tạo issue — gán **Milestone** và nhãn **Vendor/Partner** (và `Feature::` nếu dùng).
2. Đối tác làm việc trên nhánh type-prefix hợp lệ (`fix/...`, `refactor/...`, ...), mở MR vào nhánh tích hợp `feat/...-integration` tương ứng; tiêu đề MR theo format validator ở [Git Flow](../workflow/git-flow.md).
3. Gắn nhãn vendor trên MR (thủ công hoặc automation).
4. Khi nghiệm thu: lọc milestone/project theo vendor để xem danh sách issue/MR đã đạt **Done** / **Verifying** theo policy.
5. Merge lên nhánh tích hợp → `main` theo lịch release; tạo tag / release notes và đính kèm danh sách issue đã nghiệm thu.

## Liên quan

- [Git Flow](../workflow/git-flow.md) — nhánh `feat/` mặc định, commit, MR
- [Planning & theo dõi](./planning-and-tracking.md) — milestone, nhãn, lifecycle