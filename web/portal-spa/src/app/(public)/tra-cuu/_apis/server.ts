import "server-only";

import { apiInstance } from "@/api/instance";
import type { FetchResult } from "@/api/types";

import type { PublicWarranty } from "./types";

/** Tra cứu thẻ bảo hành công khai theo mã. */
export function lookupWarranty(
  code: string,
): Promise<FetchResult<PublicWarranty>> {
  return apiInstance.get<PublicWarranty>(
    `warranty/${encodeURIComponent(code)}`,
    { cache: "no-store" },
  );
}
