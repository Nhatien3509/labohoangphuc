import "server-only";

import { apiInstance } from "@/api/instance";
import type { FetchResult } from "@/api/types";

import type { AdminWarranty } from "./types";

/**
 * Lấy danh sách thẻ bảo hành cho admin.
 *
 * LƯU Ý: backend hiện tại (skeleton) MỚI có endpoint tạo thẻ
 * (POST /api/v1/admin/warranty-cards) và tra cứu công khai — CHƯA có GET list.
 * Khi BE bổ sung `GET /admin/warranty-cards`, hàm này sẽ hoạt động ngay.
 * Tạm thời trả mảng rỗng nếu endpoint chưa tồn tại (404).
 */
export async function listWarranties(): Promise<
  FetchResult<AdminWarranty[]>
> {
  const res = await apiInstance.get<AdminWarranty[]>("admin/warranty-cards", {
    cache: "no-store",
  });

  if (!res.success && res.status === 404) {
    return { success: true, status: 200, data: [] };
  }
  return res;
}
