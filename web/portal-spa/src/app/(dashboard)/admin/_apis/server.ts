import "server-only";

import { apiInstance } from "@/api/instance";
import type { FetchResult } from "@/api/types";

import type { WarrantyStats } from "./types";

/** Lấy thống kê tổng quan cho dashboard admin. */
export async function getWarrantyStats(): Promise<FetchResult<WarrantyStats>> {
  return apiInstance.get<WarrantyStats>("admin/warranty-stats", {
    auth: true,
    cache: "no-store",
  });
}
