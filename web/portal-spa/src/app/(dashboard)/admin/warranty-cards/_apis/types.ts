/**
 * Kiểu cho feature admin warranty-cards.
 * Khớp dto.AdminCreateWarrantyRequest / dto.AdminWarrantyResponse
 * (internal/domain/dto/admin_warranty_dto.go).
 */

export type WarrantyStatus = "active" | "expired" | "revoked";

/** Payload tạo thẻ — gửi POST /api/v1/admin/warranty-cards. */
export interface CreateWarrantyPayload {
  customer_name: string;
  customer_phone: string;
  clinic_id: string; // UUID
  product_id: string; // UUID
  lab_name: string;
  tooth_positions: number[];
  issue_date: string; // ISO date YYYY-MM-DD
  note?: string;
}

/** Thẻ trả về đầy đủ cho admin. */
export interface AdminWarranty {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  clinic_id: string;
  product_id: string;
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
