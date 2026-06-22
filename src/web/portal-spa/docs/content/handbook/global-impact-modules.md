---
sidebar_position: 7
title: Global impact modules
description: Allowed Actions, Billing, Cost estimate — các vùng ảnh hưởng toàn app
---

# Global impact modules

## Mục tiêu

- Liệt kê các **module / concern** ảnh hưởng **toàn dự án** để mọi feature mới kiểm tra checklist trước khi ship.

## Hướng dẫn chi tiết

### Allowed Actions (phân quyền UI)

#### Nguồn chuẩn để check URN

- Danh sách action theo module: `src/app/[locale]/{module}/_actions/allowed-actions.ts`.
- Guard UI phía client: `allowedActions.has(action)` qua `useLayoutStore`.
- Wrapper nút có tooltip khi thiếu quyền: `src/common/components/containers/buttons/AllowedActionButton.tsx`.
- Chuẩn map permission trong kiến trúc module: [API integration](../guidelines/api-integration.md) (`_apis/urns.ts`).

#### Phương châm xử lý theo thành phần

| Thành phần | Phương châm nghiệp vụ |
|---|---|
| Layout (navigation pane, dashboard) | Không check quyền ở mức hiển thị menu/chrome tổng thể. Vẫn hiển thị bình thường để giữ trải nghiệm điều hướng nhất quán. |
| Màn danh sách | Check quyền `list` ở server page. Nếu không có quyền: trả 403. UI hiển thị rõ quyền thiếu (nếu có thể xác định từ required URNs). |
| Màn chỉnh sửa | Bắt buộc check cả quyền `get/view` và `update/edit`. Thiếu 1 trong 2 coi như không đủ quyền thao tác. |
| Section trong trang details | Gắn quyền theo URN của API lấy dữ liệu section đó. Thiếu quyền: section hiển thị thông báo thiếu quyền thay vì silent fail. |
| Trường thông tin phụ thuộc API khác | Nếu section cần map thêm dữ liệu từ API khác để render đầy đủ: ưu tiên BE trả đủ data trong API chính hoặc API phụ ổn định theo contract. |
| Combobox gọi API để lấy options | Gắn quyền theo URN của API list/get options. Thiếu quyền: khóa thao tác và thông báo quyền thiếu. |
| Combobox chứa action redirect | Không check quyền ở control redirect. Quyền sẽ được check ở màn đích. |
| Combobox chứa action mở popup | Disable action khi thiếu quyền; hover hiển thị quyền thiếu. |
| Button group (nút cha chứa danh sách action con) | Nút nhóm vẫn enable để mở menu; action con thiếu quyền thì disable + tooltip quyền thiếu. Có thể xử lý ngoại lệ theo nghiệp vụ đặc thù đã thống nhất. |
| Button redirect / hyperlink | Không check quyền tại nút. Màn đích tự chịu trách nhiệm guard quyền. |
| Button mở popup | Disable button khi thiếu quyền; hover hiển thị quyền thiếu. |
| Xóa có phụ thuộc dữ liệu khác | Ưu tiên có API `validate-delete` trả danh sách item phụ thuộc trước khi xóa. Quyền xóa check theo URN delete. Nếu chưa có API, giữ hành vi hiện tại và ghi rõ rủi ro trong MR. |
| Đã check quyền nhưng API vẫn trả lỗi quyền | BE cần trả thông báo rõ user thiếu quyền nào (tối thiểu action/permission code) để FE hiển thị minh bạch. |

#### Quy tắc triển khai

1. Quyền route/page check ở server trước (middleware hoặc fetch guard) để chặn sớm 403.
2. Quyền CTA/action check ở client bằng `allowedActions.has(actionUrn)`.
3. Redirect action không chặn ở source; chặn ở destination.
4. Popup/action nội trang phải disable + tooltip khi thiếu quyền.
5. Không hardcode URN trong component; import từ module `_actions/allowed-actions.ts` (hoặc map tương đương).

**Checklist MR:**

- [ ] Mọi CTA mới đã gắn allowed action đúng URN?
- [ ] Màn list/details/edit đã check đủ nhóm quyền bắt buộc?
- [ ] Các action popup đã disable + tooltip khi thiếu quyền?
- [ ] Redirect action để màn đích tự guard, không check trùng ở nguồn?
- [ ] Trường hợp API vẫn 403 đã có thông báo rõ quyền thiếu?

### Billing

- Nhiều màn có thể phụ thuộc **billing account** / context từ layout store (ví dụ `billingAccount`).
- Khi module billing được tích hợp, đăng ký feature flag trong `src/common/lib/feature-flags/config.ts` và `src/env.js` theo chuẩn module playbook.
- Khi chạm billing, đọc code hiện tại của màn hình tương tự trước khi thêm route mới.

**Checklist MR:** có phụ thuộc gói/thanh toán không? Đã kiểm tra flag + context account?

### Estimate cost (ước tính chi phí)

- UI tái sử dụng **`CostEstimateCard`** và pattern gọi API estimate (ví dụ `getDBInstanceCostEstimate`) trong flow tạo resource.
- Tham chiếu điển hình: `src/app/[locale]/dbaas/instances/create/_components/CreateDBInstance.tsx` (state `estimateValue`, `loadingCostEstimate`, debounce submit để estimate).
- Component chung: `src/common/components/cards/CostEstimateCard.tsx`; nút/preview: `PreviewResourceButtons` trong `containers/buttons/`.

Nếu dịch vụ mới cần estimate: **tái sử dụng** pattern trên và type `CostEstimate` từ API common (kiểm tra import thực tế trong module).

## Ví dụ

**Feature flag (server) — ví dụ:**

```ts
import { getFeatureFlags } from "@common/lib/feature-flags/server";

const [isModuleEnabled] = getFeatureFlags(["module.enabled"]);
if (!isModuleEnabled) {
  // redirect hoặc notFound tùy product
}
```

**Gợi ý checklist trước khi merge**

- [ ] Allowed action cho từng CTA
- [ ] Billing context / flag nếu màn liên quan tiền
- [ ] Cost estimate (nếu có) dùng component/pattern chung, không tự dựng card lệch design
