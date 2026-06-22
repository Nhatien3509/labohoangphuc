---
sidebar_position: 5
title: Component usage (khi chưa có Storybook)
description: Layout, Table, Dialog, Form và Date/Time components — tra cứu nhanh + ví dụ thực tế
---

# Component usage (khi chưa có Storybook)

## Mục tiêu

- Hướng dẫn nhanh các component dùng nhiều trong dự án.
- Chỉ ra khi nào chọn từng component, thay vì dựng mới.
- Nhấn mạnh semantic HTML và A11y cho Table/Dialog/Form.

## Hướng dẫn chi tiết

### Nguyên tắc chung

1. Tra implementation thực tế trong `src/common/components/ui/` và **containers** trong `src/common/components/containers/`.
2. Đối chiếu Figma file component library (link nội bộ tại [References](./references.md)).
3. Đọc thêm [UI Components](../guidelines/ui-components.md) và chạy `pnpm storybook` khi component đã có story.

### 1) Layout & page wrappers

| Thành phần | Dùng khi nào | Source | Ví dụ |
|---|---|---|---|
| `LayoutWithSidebar` | Module cần Sidebar + Breadcrumb + Content, có xử lý `isNotFound` + loading | `src/common/components/layout/LayoutWithSidebar.tsx` | `src/app/[locale]/cloud-server/layout.tsx` |
| `CloudServerProvider` | Cần preload dữ liệu dùng chung cho module + billing guard | `src/app/[locale]/cloud-server/_providers/CloudServerProvider.tsx` | `src/app/[locale]/cloud-server/layout.tsx` |
| `withPage` | Chuẩn hóa flow fetch data + loading + 403/404/500 ở page | `src/common/components/layout/PageGenerator.tsx` | `src/app/[locale]/network/subnets/page.tsx` |
| `withLoading` | Bọc Suspense fallback cho layout/page | `src/common/components/layout/PageGenerator.tsx` | `src/app/[locale]/billing/layout.tsx` |

### 2) Table stack

| Thành phần | Mục đích | Source | Ví dụ |
|---|---|---|---|
| `DataTable` | Render table từ `useReactTable`, không fetch data | `src/common/components/containers/tables/DataTable.tsx` | `src/app/[locale]/billing/account/_components/LinkedProjectsCard.tsx` |
| `useResponsiveColumns` | Tính width cột responsive, shadow trái/phải, `elementRef` cho wrapper | `src/common/hooks/useResponsiveColumns.tsx` | `src/app/[locale]/billing/account/_components/LinkedProjectsCard.tsx` |
| `TablePagination` | UI phân trang và callback đổi page/pageSize | `src/common/components/containers/tables/TablePagination.tsx` | `src/app/[locale]/billing/cost-analysis/_components/CostAnalysisTable.tsx` |
| `CommonTable` | Parent tự quản lý state `page/pageSize/search/filter` | `src/common/components/containers/tables/CommonTable.tsx` | `src/app/[locale]/backup/policies/[policyId]/apply/_components/VolumesTab.tsx` |
| `ServerCommonTable` | Đồng bộ query params trên URL, fetch theo params | `src/common/components/containers/tables/CommonTable.tsx` | `src/app/[locale]/kubernetes/clusters/_components/ClustersTable.tsx` |

Quy tắc chọn nhanh:

- Dữ liệu đã có sẵn trong props và state quản lý ở client: dùng `CommonTable`.
- Dữ liệu đi theo URL (`page`, `pageSize`, `search`, `filter`): dùng `ServerCommonTable`.
- Chỉ cần render table thuần: dùng `DataTable` + `TablePagination`.

### 3) Dialog stack

| Thành phần | Mục đích | Source | Ví dụ |
|---|---|---|---|
| `BaseDialogContainer` | Dialog reusable base (controlled open state, title, description, footer) | `src/common/components/containers/dialogs/BaseDialogContainer.tsx` | `src/common/components/dialogs/AskQuestionsDialog.tsx` |
| `DialogContainer` | Dialog manager toàn cục qua layout store | `src/common/components/containers/dialogs/DialogContainer.tsx` | `src/app/[locale]/cloud-server/layout.tsx` |
| `AnnouncementDialog` | Dialog thông báo/xác nhận đơn giản | `src/common/components/dialogs/AnnouncementDialog.tsx` | `src/app/[locale]/billing/_components/EnableBillingCard.tsx` |
| `AskQuestionsDialog` | Dialog gửi câu hỏi/feedback | `src/common/components/dialogs/AskQuestionsDialog.tsx` | `src/common/components/dialogs/AskQuestionsDialog.tsx` |
| `DeleteItemsDialog` | Dialog xác nhận xóa 1/nhiều item, hỗ trợ confirmation prompt | `src/common/components/dialogs/DeleteItemsDialog.tsx` | `src/common/components/containers/tables/CommonTable.tsx` |

Lưu ý:

- Nếu đi theo flow `DialogContainer`, ưu tiên dùng `useCustomForm` để đồng bộ submit/validation qua dialog manager.
- Với hành động nguy hiểm (xóa, hủy tài nguyên), luôn hiển thị copy rõ ràng và trạng thái loading.

### 4) Cards, action permission và form fields

| Thành phần | Mục đích | Source |
|---|---|---|
| `CardContainer` | Card wrapper chuẩn với title/description | `src/common/components/containers/cards/CardContainer.tsx` |
| `CollapsibleCardContainer` | Card có thể thu gọn/mở rộng | `src/common/components/containers/cards/CollapsibleCardContainer.tsx` |
| `AllowedActionButton` | Wrapper button kiểm soát quyền và tooltip khi bị chặn | `src/common/components/containers/buttons/AllowedActionButton.tsx` |
| `Input` / `InputForm` | Input UI thuần và input tích hợp React Hook Form | `src/common/components/ui/input.tsx`, `src/common/components/containers/forms/InputForm.tsx` |
| `Select` / `SelectContainer` / `SelectForm` | Select thuần, select chuẩn hệ thống, select tích hợp form | `src/common/components/ui/select.tsx`, `src/common/components/containers/selects/SelectContainer.tsx`, `src/common/components/containers/forms/SelectForm.tsx` |
| `TextareaForm` | Textarea tích hợp React Hook Form | `src/common/components/containers/forms/TextareaForm.tsx` |

### 5) Date/Time components

| Thành phần | Mục đích | Source |
|---|---|---|
| `TimePicker` / `TimePickerForm` | Chọn giờ/phút/giây và wrapper cho form | `src/common/components/containers/datetime/TimePicker.tsx`, `src/common/components/containers/forms/TimePickerForm.tsx` |
| `DatePicker` | Date range picker có quick select + apply/cancel | `src/common/components/containers/datetime/DatePicker.tsx` |
| `DateRangePickerForm` | Bọc `DatePicker` vào React Hook Form | `src/common/components/containers/forms/DateRangePickerForm.tsx` |
| `DatePickerForm` | Chọn 1 ngày (single date) trong form | `src/common/components/containers/forms/DatePickerForm.tsx` |

### 6) A11y checklist (áp dụng bắt buộc)

- Table: dùng semantic tags đầy đủ (`table`, `thead`, `tbody`, `th`, `td`) và trạng thái sort rõ ràng.
- Dialog: có `DialogTitle`, `DialogDescription` khi cần; nút đóng icon có `aria-label`.
- Form: label luôn gắn với control; lỗi field hiển thị gần input và có `aria-invalid`.
- Loading: ưu tiên skeleton theo layout thay vì spinner trống giữa trang.

## Ví dụ

**Khởi tạo page theo chuẩn `withPage`:**

```tsx
import { withPage } from "@common/components/layout/PageGenerator";

async function fetchData(query: { page: number; pageSize: number }) {
  // fetch API và trả về FetchResult
}

function PageContent({ data }: { data: unknown }) {
  return <div>{/* render */}</div>;
}

export default withPage(fetchData, { page: 1, pageSize: 10 })(PageContent);
```

**Dialog (minh họa A11y):**

```tsx
<DialogContent aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <DialogHeader>
    <DialogTitle id="dialog-title">Xác nhận xóa</DialogTitle>
    <DialogDescription id="dialog-desc">
      Hành động này không hoàn tác.
    </DialogDescription>
  </DialogHeader>
  {/* actions */}
</DialogContent>
```

**Import phổ biến (thực tế project):**

```typescript
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@common/components/ui/dialog";
import { ServerCommonTable } from "@common/components/containers/tables/CommonTable";
import InputForm from "@common/components/containers/forms/InputForm";
import SelectForm from "@common/components/containers/forms/SelectForm";
```
