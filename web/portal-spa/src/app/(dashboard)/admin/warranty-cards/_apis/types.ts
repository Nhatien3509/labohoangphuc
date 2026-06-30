/**
 * Kiểu cho feature admin warranty-cards.
 * Khớp dto.AdminCreateWarrantyRequest / dto.AdminWarrantyResponse
 * (internal/domain/dto/admin_warranty_dto.go).
 */

export type WarrantyStatus = "active" | "expired" | "revoked";

/** Payload tạo thẻ — gửi POST /api/v1/admin/warranty-cards. */
export interface CreateWarrantyPayload {
  code?: string; // mã thẻ; để trống thì BE tự sinh
  customer_name: string;
  customer_phone: string;
  lab_name: string;
  tooth_positions: number[];
  warranty_months: number; // số tháng bảo hành
  issue_date: string; // ISO date YYYY-MM-DD
  note?: string;
}

/** Payload sửa thẻ — gửi PUT /api/v1/admin/warranty-cards/:id (có thêm status). */
export interface UpdateWarrantyPayload extends CreateWarrantyPayload {
  status: WarrantyStatus;
}

/** Thẻ trả về đầy đủ cho admin. */
export interface AdminWarranty {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  lab_name: string;
  tooth_positions: number[];
  warranty_months: number;
  issue_date: string;
  expiry_date: string;
  status: WarrantyStatus;
  note?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
