import type { DefaultParams } from "@common/lib/helpers/params";
import type { GETResponse } from "@/api/types";
import { apiInstance } from "@/api/instance";
import {
  PLACEHOLDER_ITEMS_TAG,
  type PlaceholderListItem,
} from "@{{SLUG}}/_apis/types";

/** Sample list fetch — replace path, types, and tag with real API contracts. */
export const getPlaceholderList = (queries?: DefaultParams) => {
  return apiInstance.get<GETResponse<PlaceholderListItem>>(
    `{{SLUG}}/items/`,
    {
      query: queries,
      next: { tags: [PLACEHOLDER_ITEMS_TAG] },
    },
  );
};
