"use server";

import { revalidatePath } from "next/cache";

import { apiInstance } from "@/api/instance";

import type {
  AdminWarranty,
  CreateWarrantyPayload,
  UpdateWarrantyPayload,
} from "./types";

const LIST_PATH = "/admin/warranty-cards";

export interface ActionResult {
  success: boolean;
  /** Mã lỗi backend khi thất bại (vd: CODE_DUPLICATED). */
  error?: string;
  data?: AdminWarranty;
}

/**
 * BE bind `issue_date` sang time.Time (yêu cầu RFC3339), nên chuyển chuỗi
 * YYYY-MM-DD từ form thành mốc thời gian RFC3339 trước khi gửi.
 */
function toBody(
  payload: CreateWarrantyPayload | UpdateWarrantyPayload,
): Record<string, unknown> {
  return {
    ...payload,
    issue_date: new Date(`${payload.issue_date}T00:00:00Z`).toISOString(),
  };
}

/** Server Action: kiểm tra mã thẻ đã tồn tại hay chưa. */
export async function checkCodeAction(
  code: string,
): Promise<{ exists: boolean }> {
  const res = await apiInstance.get<{ exists: boolean }>(
    "admin/check-warranty-code",
    { auth: true, query: { code } },
  );
  return { exists: Boolean(res.data?.exists) };
}

export interface ImportResult {
  created: number;
  failed: { code: string; error: string }[];
}

/**
 * Server Action: nhập hàng loạt thẻ từ Excel.
 * Tạo tuần tự từng thẻ qua endpoint có sẵn, gom kết quả để báo cáo từng dòng lỗi.
 */
export async function importWarrantiesAction(
  rows: CreateWarrantyPayload[],
): Promise<ImportResult> {
  let created = 0;
  const failed: { code: string; error: string }[] = [];

  for (const row of rows) {
    const res = await apiInstance.post<AdminWarranty>("admin/warranty-cards", {
      auth: true,
      payload: toBody(row),
    });
    if (res.success) {
      created += 1;
    } else {
      failed.push({
        code: row.code?.trim() || "(trống)",
        error: res.error ?? "Lỗi không xác định",
      });
    }
  }

  if (created > 0) revalidatePath(LIST_PATH);
  return { created, failed };
}

/** Server Action: tạo thẻ bảo hành mới. */
export async function createWarrantyAction(
  payload: CreateWarrantyPayload,
): Promise<ActionResult> {
  const res = await apiInstance.post<AdminWarranty>("admin/warranty-cards", {
    auth: true,
    payload: toBody(payload),
  });

  if (res.success) {
    revalidatePath(LIST_PATH);
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error };
}

/** Server Action: sửa thẻ bảo hành. */
export async function updateWarrantyAction(
  id: string,
  payload: UpdateWarrantyPayload,
): Promise<ActionResult> {
  const res = await apiInstance.put<AdminWarranty>(
    `admin/warranty-cards/${id}`,
    { auth: true, payload: toBody(payload) },
  );

  if (res.success) {
    revalidatePath(LIST_PATH);
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error };
}

/** Server Action: xoá thẻ bảo hành. */
export async function deleteWarrantyAction(id: string): Promise<ActionResult> {
  const res = await apiInstance.delete<unknown>(`admin/warranty-cards/${id}`, {
    auth: true,
  });

  if (res.success) {
    revalidatePath(LIST_PATH);
    return { success: true };
  }
  return { success: false, error: res.error };
}
