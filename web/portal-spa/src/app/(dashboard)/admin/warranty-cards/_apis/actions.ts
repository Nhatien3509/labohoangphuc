"use server";

import { revalidatePath } from "next/cache";

import { apiInstance } from "@/api/instance";

import type { AdminWarranty, CreateWarrantyPayload } from "./types";

export interface ActionResult {
  success: boolean;
  /** Mã lỗi backend khi thất bại (vd: CODE_DUPLICATED). */
  error?: string;
  data?: AdminWarranty;
}

/** Server Action: tạo thẻ bảo hành mới. */
export async function createWarrantyAction(
  payload: CreateWarrantyPayload,
): Promise<ActionResult> {
  const res = await apiInstance.post<AdminWarranty>("admin/warranty-cards", {
    payload: payload as unknown as Record<string, unknown>,
  });

  if (res.success) {
    revalidatePath("/admin/warranty-cards");
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error };
}
