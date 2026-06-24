import { z } from "zod";

/** Schema kiểm tra form tạo thẻ bảo hành (khớp ràng buộc binding của BE). */
export const createWarrantySchema = z.object({
  customer_name: z.string().min(1, "Bắt buộc nhập tên khách hàng"),
  customer_phone: z.string().min(1, "Bắt buộc nhập số điện thoại"),
  clinic_id: z.string().uuid("clinic_id phải là UUID hợp lệ"),
  product_id: z.string().uuid("product_id phải là UUID hợp lệ"),
  lab_name: z.string().min(1, "Bắt buộc nhập tên Lab"),
  // Nhập "11, 12, 21" -> chuẩn hoá thành number[] khi submit.
  tooth_positions: z.string().min(1, "Bắt buộc nhập vị trí răng"),
  issue_date: z.string().min(1, "Bắt buộc chọn ngày phát hành"),
  note: z.string().optional(),
});

export type CreateWarrantyForm = z.infer<typeof createWarrantySchema>;

export const DEFAULT_LAB_NAME = "Lab Hà Nội";

/** "11, 12, 21" -> [11, 12, 21]. */
export function parseToothPositions(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}
