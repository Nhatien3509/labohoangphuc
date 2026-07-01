import { z } from "zod";

/** Schema kiểm tra form tạo thẻ bảo hành (khớp ràng buộc binding của BE). */
export const createWarrantySchema = z.object({
  // Mã thẻ bắt buộc, nhập tuỳ ý (không ràng buộc định dạng).
  code: z.string().trim().min(1, "Bắt buộc nhập mã thẻ"),
  customer_name: z.string().min(1, "Bắt buộc nhập tên khách hàng"),
  clinic_name: z.string().min(1, "Bắt buộc nhập tên nha khoa"),
  lab_name: z.string().min(1, "Bắt buộc nhập tên Lab"),
  // Nhập "11, 12, 21" -> chuẩn hoá thành number[] khi submit.
  tooth_positions: z.string().min(1, "Bắt buộc nhập vị trí răng"),
  // Người dùng nhập theo NĂM; backend lưu theo tháng (năm × 12) khi submit.
  warranty_years: z.coerce
    .number()
    .int("Số năm phải là số nguyên")
    .min(1, "Số năm bảo hành tối thiểu là 1"),
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

/** Năm -> tháng (backend lưu theo tháng). */
export function yearsToMonths(years: number): number {
  return Math.round(years * 12);
}

/** Tháng -> năm để hiển thị (làm tròn, tối thiểu 1 năm cho dữ liệu cũ). */
export function monthsToYears(months: number): number {
  return Math.max(1, Math.round(months / 12));
}

/** "11, 12, 21" -> [11, 12, 21]. */
export function parseToothPositions(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}
