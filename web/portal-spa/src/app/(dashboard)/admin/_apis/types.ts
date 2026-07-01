/**
 * Kiểu dữ liệu thống kê dashboard admin.
 * Khớp dto.WarrantyStatsResponse (internal/domain/dto/admin_warranty_dto.go).
 */

export interface WarrantyMonthlyStat {
  month: string; // "YYYY-MM"
  new: number; // Số thẻ tạo mới trong tháng
  total: number; // Tổng luỹ kế đến hết tháng
}

export interface WarrantyStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  new_this_month: number;
  new_this_year: number;
  monthly: WarrantyMonthlyStat[];
}
