/**
 * Kiểu dữ liệu trả về từ endpoint tra cứu công khai:
 *   GET /api/v1/warranty/:code
 * Khớp PublicWarrantyLookupResponse (internal/domain/dto/warranty_response.go).
 */
export interface PublicWarranty {
  code: string;
  customer_name: string;
  clinic_name: string;
  lab_name: string;
  tooth_positions: number[];
  issue_date: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
}
