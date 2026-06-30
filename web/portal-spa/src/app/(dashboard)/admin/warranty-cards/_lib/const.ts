import { z } from "zod";

/** Schema kiểm tra form tạo thẻ bảo hành (khớp ràng buộc binding của BE). */
export const createWarrantySchema = z.object({
  // Mã thẻ bắt buộc, nhập tuỳ ý (không ràng buộc định dạng).
  code: z.string().trim().min(1, "Bắt buộc nhập mã thẻ"),
  customer_name: z.string().min(1, "Bắt buộc nhập tên khách hàng"),
  customer_phone: z.string().min(1, "Bắt buộc nhập số điện thoại"),
  lab_name: z.string().min(1, "Bắt buộc nhập tên Lab"),
  // Nhập "11, 12, 21" -> chuẩn hoá thành number[] khi submit.
  tooth_positions: z.string().min(1, "Bắt buộc nhập vị trí răng"),
  warranty_months: z.coerce
    .number()
    .int("Số tháng phải là số nguyên")
    .min(1, "Số tháng bảo hành tối thiểu là 1"),
  issue_date: z.string().min(1, "Bắt buộc chọn ngày phát hành"),
  note: z.string().optional(),
});

export type CreateWarrantyForm = z.infer<typeof createWarrantySchema>;

/** Schema sửa thẻ = schema tạo thẻ (gồm cả mã) + trạng thái. */
export const updateWarrantySchema = createWarrantySchema.extend({
  status: z.enum(["active", "expired", "revoked"]),
});

export type UpdateWarrantyForm = z.infer<typeof updateWarrantySchema>;

/** Tuỳ chọn trạng thái cho dropdown sửa thẻ. */
export const WARRANTY_STATUS_OPTIONS = [
  { value: "active", label: "Đang hiệu lực" },
  { value: "expired", label: "Hết hạn" },
  { value: "revoked", label: "Đã thu hồi" },
] as const;

export const DEFAULT_LAB_NAME = "Lab Hà Nội";
export const DEFAULT_WARRANTY_MONTHS = 84;

/** "11, 12, 21" -> [11, 12, 21]. */
export function parseToothPositions(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}
