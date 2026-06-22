---

## sidebar_position: 2
title: Giao tiếp & ánh xạ công cụ
description: Phối hợp hiệu quả giữa các vai trò; kênh theo loại thông tin; MR/review; traceability và async

# Giao tiếp & ánh xạ công cụ

Tài liệu này bổ sung [Planning & theo dõi](./planning-and-tracking.md): quy định **loại thông tin đặt ở đâu** để tránh phân mảnh, **cách phối hợp** giữa các bên (nội bộ và đối tác) cho đủ ngữ cảnh mà không phụ thuộc chat, và quy tắc **lưu vết** (traceability) phục vụ tra cứu sau này.

Chi tiết kỹ thuật MR, CI và checklist chất lượng: [Git Flow](../workflow/git-flow.md), [Code review](../workflow/code-review.md), [CI/CD](../workflow/ci-cd.md). Vận hành nhiều bên / vendor: [Đối tác & bundle](./partner-delivery.md).

## Nguyên tắc phối hợp

- **Đúng kênh cho đúng độ bền thông tin:** quyết định cần tra cứu sau này phải kết thúc trên **issue / MR / tài liệu trong repo** (hoặc ADR khi đủ lớn); chat và họp chỉ để đồng bộ nhanh hoặc gỡ blocker.
- **Async-first:** ưu tiên câu trả lời trên issue/MR thread để mọi người cùng nhịp; chat dùng để **ping** kèm link, không thay thế mô tả đầy đủ.
- **Một luồng trách nhiệm rõ:** mỗi hạng mục có **issue (hoặc parent issue) gắn milestone** khi team dùng milestone; MR **liên kết** issue (`Closes #id` / `Refs #id` theo [Git Flow](../workflow/git-flow.md)) để đóng vòng traceability.
- **Chốt thiết kế có đầu có đuôi:** tranh luận UI trên công cụ thiết kế; khi chốt — cập nhật file thiết kế **và** để lại link + ghi chú ngắn trên task/issue liên quan (xem ma trận bên dưới).

## Luồng phối hợp theo giai đoạn (gợi ý)

Bảng dưới là **khung làm việc** — tên cột board và vai trò cụ thể (BA, QA, Lead…) tùy team map vào [lifecycle](./planning-and-tracking.md#vòng-đời-trạng-thái-lifecycle).


| Giai đoạn                 | Mục tiêu phối hợp                                               | Nơi ghi nhận / đồng bộ                                                                                                               |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Làm rõ phạm vi**        | Cùng hiểu acceptance criteria, rủi ro, phụ thuộc API/permission | Mô tả issue; bổ sung comment khi BA/PM cập nhật — tránh chỉ trao đổi miệng                                                           |
| **Thiết kế**              | Layout, trạng thái component, responsive tối thiểu              | Figma (hoặc tool tương đương) là SSOT visual; link trên issue                                                                        |
| **Triển khai**            | Dev tự kiểm self-review, CI, convention                         | MR + mô tả theo template repo; thread trên MR cho góp ý kỹ thuật                                                                     |
| **Kiểm tra / nghiệm thu** | Xác nhận hành vi trên môi trường thống nhất                     | Cập nhật trạng thái issue (ví dụ **Verifying** → **Done** theo policy); ghi rõ cách reproduce / ảnh hưởng trên MR hoặc issue nếu cần |
| **Sau merge**             | Release, cờ tính năng, tài liệu đi kèm                          | Theo [CI/CD](../workflow/ci-cd.md) và checklist trong [Code review](../workflow/code-review.md)                                      |


**Điểm nghẽn thường gặp — cách xử lý giao tiếp:** nếu phát hiện sai lệch spec ↔ code, **dừng tranh luận dài trên chat**: mở hoặc cập nhật issue (hoặc comment có `@` rõ người quyết) và dẫn link MR; designer cập nhật Figma nếu thay đổi visual.

## MR & review: kỳ vọng giao tiếp

- **Trước khi gắn reviewer:** author đã self-review, **CI xanh**, tiêu đề MR đúng [Git Flow](../workflow/git-flow.md) (ví dụ `feat`/`fix` có suffix ticket `[ABC-123]` ở **cuối** tiêu đề khi team áp dụng quy ước đó), mô tả có cách verify và link issue.
- **Khi sẵn sàng cho review:** chuyển cột / trạng thái trên tracker theo quy ước team (ví dụ **Review**); nếu cần ping trên chat — dùng [cấu trúc tin nhắn](#response-culture) kèm **link MR**, không chỉ screenshot không ngữ cảnh.
- **Trong review:** thảo luận **trên thread MR**; ghi rõ **blocking** vs **follow-up** để author ưu tiên. Kiến trúc / an toàn / module mới: đối chiếu [Module anatomy](../architecture/module-anatomy.md) và [Code review](../workflow/code-review.md); không “chốt kiến trúc” chỉ qua tin nhắn riêng.
- **Sau khi merge:** nếu còn bước verify trên staging, giữ issue ở trạng thái phù hợp ([Planning](./planning-and-tracking.md)) cho đến khi đạt **Done** theo Definition of Done của team.

Nếu team có **cổng QA** (ví dụ chỉ gắn reviewer chính sau khi đã xác nhận trên preview), hãy ghi **một dòng policy** trong quy trình nội bộ hoặc mô tả board — tài liệu này không cố định tên nhãn cụ thể.

## Phối hợp với đối tác / vendor

- Dùng **nhãn và metadata** trên issue/MR (vendor, milestone, feature) thay vì chỉ trao đổi tên qua chat — chi tiết: [Đối tác & bundle](./partner-delivery.md).
- **Board / saved view** theo vendor hoặc theo milestone giúp báo cáo tiến độ khách quan; họp định kỳ chỉ nên **đối chiếu board**, không đọc lại toàn bộ danh sách việc từ đầu.
- **CODEOWNERS** (khi áp dụng) là công cụ phân reviewer theo vùng code — không thay thế việc gắn issue và mô tả MR rõ ràng.

## Ma trận công cụ (communication mapping)

Mỗi loại nội dung nên có “ngăn chứa” mặc định — tên công cụ cụ thể (GitLab, Slack, Figma…) phụ thuộc team, vai trò dưới đây là cố định:


| Loại thông tin                             | Công cụ gợi ý                      | Vai trò                                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tri thức kỹ thuật & quyết định đã chốt** | **Git / repo**                     | **SSOT cho code:** MR, review, ADR/spec trong repo, changelog. Đây là nơi tra cứu “đã quyết gì” sau khi merge.                                                                                                                          |
| **Thiết kế thị giác (UI/UX)**              | **Công cụ thiết kế** (ví dụ Figma) | **SSOT cho visual:** layout, màu, component trạng thái. Thảo luận trực diện trên file thiết kế; khi chốt, **dẫn link** vào issue/task tương ứng. **Link Figma cố định trong repo:** [Handbook — References](../handbook/references.md). |
| **Thông báo & nhắc việc gấp**              | **Chat**                           | Kênh ngắn: ping, bot, P0 — **không** thay thế mô tả đầy đủ trên issue hay quyết định trên MR.                                                                                                                                           |


**Phân biệt SSOT:** Implementation và quyết định kỹ thuật **đã vào code** nằm ở Git; **mockup/spec giao diện** nằm ở tool thiết kế. Tranh luận “chốt thiết kế” nên kết thúc bằng cập nhật Figma + link trên task, không chỉ chat.

## Cấu trúc kênh chat (giảm nhiễu)

Nên tách **chủ đề / channel** thay vì một luồng chung — tên dưới đây là **ví dụ**, team đặt tên tương đương trên Slack, Teams, Mattermost, v.v.:

1. **Thông báo hệ thống (chỉ bot / auto):** MR mới, CI, cập nhật issue — *có thể tắt chuông*, đọc theo đợt.
2. **Thảo luận nội bộ:** hỏi nhanh, sync ngắn, không thay thế mô tả task.
3. **Khẩn cấp / P0:** sự cố production hoặc blocker — *ưu tiên thông báo*; chỉ dùng đúng mức.
4. **Review / ping:** gửi link MR hoặc bản thiết kế cần xem gấp — dùng cấu trúc tin nhắn trong mục “Văn hóa phản hồi” bên dưới.

## Lưu vết & liên kết (traceability)

- **Gắn mã định danh task:** Tin nhắn hoặc comment **quan trọng** trên chat/thiết kế nên kèm **ID issue** (ví dụ `#123`) để tra cứu sau.
- **Sau thảo luận nhanh (chat / call):** Người phụ trách **tóm tắt kết quả** (summary) vào comment trên issue **trong phiên làm việc hoặc cùng ngày** — không để quyết định chỉ nằm trong chat.
- **Không giải thích logic nghiệp vụ dài** chỉ qua chat không đầu cuối: chuyển vào **mô tả issue**, **MR**, hoặc **ADR** tùy phạm vi.

Quy ước issue/MR chi tiết: [Planning & theo dõi](./planning-and-tracking.md), [Git Flow](../workflow/git-flow.md).

## Văn hóa phản hồi (khuyến nghị) {#response-culture}

- **Ưu tiên bất đồng bộ (async-first):** Hỏi và trả lời trên issue/MR khi có thể; chat dùng để ping hoặc làm rõ ngắn.
- **Cấu trúc tin nhắn ping:** Khi cần đẩy nhanh trên chat:
  `[Mục đích: Review | Hỏi | Chốt] + [Link task hoặc MR/thiết kế] + [@người liên quan] + [mức ưu tiên nếu cần]`
- **Hạn chế tag toàn team (@channel / @all):** Chỉ khi thông báo chung thật sự cần thiết hoặc khẩn cấp theo quy ước team.
- **Khung giờ tập trung:** Có thể khuyến khích họp/thảo luận nhóm vào **đầu giờ hoặc cuối ngày**, để giữa ngày cho làm việc sâu — **không** bắt buộc trừ khi team đã thống nhất policy.

## Liên quan

- [Planning & theo dõi](./planning-and-tracking.md) — issue, milestone, nhãn
- [Đối tác & bundle](./partner-delivery.md) — nhánh nâng cao, nhãn vendor, CODEOWNERS
- [Git Flow](../workflow/git-flow.md) — MR, `Closes #id`
- [Code review](../workflow/code-review.md)