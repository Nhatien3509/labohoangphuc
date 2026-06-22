---
sidebar_position: 2
title: Code review
description: Yêu cầu chất lượng, checklist review source code và quy trình merge
---

# Code review

Quy trình merge (branch, MR, CI) nằm trong [Git Flow](./git-flow.md). Trang này tập trung **chất lượng review**, **trách nhiệm hai phía** và **điều kiện đầu ra của MR**.

## Mục tiêu

- Đảm bảo code merge vào nhánh chính đạt chất lượng kỹ thuật, dễ bảo trì.
- Giữ tính nhất quán theo convention của dự án.
- Giảm rủi ro regression, lỗi bảo mật, và lỗi vận hành sau merge.

## Yêu cầu đầu ra của một MR

| Hạng mục | Yêu cầu | Trách nhiệm |
|---|---|---|
| Mô tả MR rõ ràng | Có mục tiêu thay đổi, lý do, phạm vi ảnh hưởng, cách verify, ticket/issue liên quan | Author |
| Tuân thủ convention | Đúng coding style, naming, lint rules | Author |
| CI/CD pass | Build/test/lint pass theo pipeline | Author + CI |
| Test coverage hợp lý | Theo [lộ trình phase trong Testing](./testing.md): logic mới (phase 1), thêm component mới (phase 2), hoặc toàn source khi đã phase 3; đối chiếu coverage report khi cần | Author + Reviewer |
| MR sạch | Không conflict, không để file tạm | Author |
| Review 2 chiều | Self-review + review/approval theo policy team | Author + Reviewer |
| Không debug tạm | Không để `console.log`, TODO tạm, code dead | Author |
| Không ảnh hưởng UI/perf chính | Đã kiểm tra local các màn hình/flow bị tác động | Author + QA |
| Cập nhật tài liệu | Update docs khi thay đổi kiến trúc/API/quy trình | Author |

## Author (người mở MR)

- Điền mô tả rõ ràng theo template mặc định của remote Git trong repo (`.github/pull_request_template.md` hoặc `.gitlab/merge_request_templates/default.md`); MR gắn issue/ticket theo [Planning & theo dõi](../delivery/planning-and-tracking.md) nếu team áp dụng.
- Self-review trước khi gắn reviewer: đọc diff, chạy `pnpm lint` (xem [Lint & code quality](../guidelines/lint-and-quality.md)), và test/build phù hợp thay đổi.
- MR nhỏ, một mục tiêu rõ — dễ review hơn một thay đổi khổng lồ.
- Nếu đụng **kiến trúc** (cấu trúc module, import giữa module, migration): đối chiếu [Module Anatomy](../architecture/module-anatomy.md) và [Migration Status](../architecture/migration-status.md); cập nhật docs nếu cần.

### Checklist tự review (trước khi gắn reviewer)

- [ ] Không còn `console.log` / debug code tạm (trừ khi có lý do và đã thống nhất)
- [ ] Test cho logic mới hoặc regression khi sửa bug nặng
- [ ] Accessibility cơ bản cho UI mới (label, focus, contrast khi có thể)
- [ ] Đã đối chiếu checklist test trong [Testing](./testing.md)

## Checklist review source code (chi tiết)

### A) Code quality

- [ ] Code rõ ràng, dễ đọc; chỉ comment ở chỗ khó hiểu.
- [ ] Không trùng lặp logic, hạn chế hardcode.
- [ ] Tên biến/hàm/component đúng ngữ nghĩa, đúng ngữ pháp.
- [ ] Không commit artifact build, cache, hoặc thư mục phụ thuộc.

### B) Coding style

- [ ] Component/hook tuân theo convention của dự án.
- [ ] Nếu cần đối chiếu best practices JS tổng quát: tham khảo Airbnb guide https://javascript.airbnb.tech/ (ưu tiên convention nội bộ khi có khác biệt).
- [ ] Hooks ở top-level, không gọi trong condition/loop.
- [ ] Props và types rõ ràng.
- [ ] JSX dễ đọc, tránh lồng quá sâu.
- [ ] Tách nhỏ khi file/component phình to; ưu tiên chia sang helper/hook riêng.
- [ ] Hạn chế lạm dụng `useEffect`; dependency list rõ ràng.
- [ ] Callback truyền sâu nên ổn định tham chiếu khi cần (`useCallback`).

### C) Architecture & structure

- [ ] File/component nằm đúng thư mục chức năng.
- [ ] Tách UI, business logic, API calls.
- [ ] Không phá vỡ boundary hoặc import rule giữa modules.
- [ ] Config/env không hardcode sai môi trường.
- [ ] Module hoặc tính năng **mới ra UI**: có **feature flag** master (env + `config.ts`) và đã gate đúng chỗ, hoặc MR ghi rõ **ngoại lệ** đã thống nhất — [Module playbook](../guidelines/module-playbook.md#playbook-modular-service).
- [ ] Allowed actions tuân theo phương châm trong [Global impact modules](../handbook/global-impact-modules.md) (route guard, URN mapping, hành vi disable/tooltip).

### D) Functionality & impact

- [ ] Không làm vỡ flow hiện tại.
- [ ] Đã test local các đường đi chính liên quan.
- [ ] Không duplicate logic có sẵn ở module khác.

### E) Security

- [ ] Không hardcode token/password/secret.
- [ ] Validate input (form/query params) phù hợp.
- [ ] Không lộ dữ liệu nhạy cảm qua log/error message.

### F) Testing

- [ ] Đáp ứng chuẩn **phase** đang áp dụng ([Testing](./testing.md)): logic mới; component mới khi team đã ở phase 2.
- [ ] Test case rõ ràng và pass.
- [ ] Coverage phần thay đổi (hoặc toàn file trong phạm vi phase) đạt mức team thống nhất.

### G) UI/UX

- [ ] Giao diện **bám design/spec** trong phạm vi đã có Figma hoặc pattern chung; **responsive** theo [Module playbook](../guidelines/module-playbook.md#responsive) (mobile-first, bảng scroll/ẩn cột, không chỉ thu nhỏ chữ). Khi spec chưa phủ hết breakpoint, vẫn phải **không vỡ layout** và dùng được trên kích thước thường gặp.
- [ ] Styling theo [quan điểm Tailwind / design kit](../guidelines/ui-components.md#styling-and-design-kit): không CSS rời, spacing/sizing không arbitrary ngoài thống nhất.
- [ ] Không vỡ layout trên màn hình/chế độ thường dùng.
- [ ] Có loading state và error state phù hợp.

## Reviewer

- **Đúng vấn đề:** Thay đổi có giải quyết ticket/mô tả không?
- **Đúng chỗ:** Cấu trúc file, import rules, không cross-module trái quy ước.
- **An toàn:** Edge cases, lỗi API, dữ liệu null/undefined.
- **Phạm vi:** Góp ý có thể làm follow-up — không bắt buộc nhồi mọi cải tiến vào cùng một MR (trừ khi blocking).

### Kiến trúc — khi nghi ngờ

- Module mới hoặc refactor lớn: đối chiếu module chuẩn (DBaaS) trong [Module Anatomy](../architecture/module-anatomy.md).
- Legacy code: không bắt buộc sửa hết trong một MR, nhưng **không mở rộng** pattern legacy cho code mới.

## Quy trình review & merge (khuyến nghị)

1. Trước khi code: làm rõ giải pháp kỹ thuật nếu case ngoài common case hoặc cần thêm thư viện mới.
2. Author mở MR: ghi rõ mục tiêu, thay đổi chính, ảnh hưởng, cách test; tự review trước.
3. Reviewer check checklist: comment theo mức độ (blocking/non-blocking).
4. Author fix và phản hồi thread rõ ràng.
5. Re-review: xác nhận đã đạt yêu cầu và merge theo policy team.

## Sau review

- Author xử lý feedback hoặc trả lời thread rõ ràng.
- Khi CI xanh và có approval theo quy ước team → merge theo [Git Flow](./git-flow.md).

## Theo dõi chất lượng định kỳ

- Tỷ lệ MR pass ngay vòng review đầu.
- Số lỗi phát hiện sau merge.
- Coverage trung bình theo sprint/tháng.
- Tỷ lệ MR vi phạm convention.

## Bước tiếp theo

Nếu đây là MR đầu tiên của bạn, đọc lại [First task walkthrough](../getting-started/first-task.md) để chắc đủ bước verify trước khi merge.
