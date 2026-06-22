/* Methods in this file are strictly used in server-side */

import { type FetchResult, type GETResponse } from "@/api/types";
import { cookies, headers } from "next/headers";
import { SUCCESS_200 } from "@common/lib/core/const";

export function getCookies<T extends string>(
  keys: T[],
  defaultValue = "",
): Record<T, string> {
  const cookieStore = cookies();
  const result = {} as Record<T, string>;

  keys.forEach((key) => {
    result[key] = cookieStore.get(key)?.value ?? defaultValue;
  });

  return result;
}

export function getIamHeaders() {
  const { organizationId } = getCookies(["organizationId"]);

  return {
    "organization-id": organizationId,
  };
}

export const getPathname = () => {
  const headersList = headers();
  const pathname = headersList.get("x-next-path") ?? "/";
  return pathname;
};

export const getReturnUrl = (req: Request) => {
  return new URL(req.url).searchParams.get("returnUrl") ?? null;
};

export const getRedirectUrl = (req: Request, redirect_uri: string) => {
  const returnUrl = getReturnUrl(req);

  return returnUrl ? `${redirect_uri}?returnUrl=${returnUrl}` : redirect_uri;
};

export const fetchIfAllowed = <T>({
  allowedActions,
  action,
  validTab,
  fn,
  tab = "",
}: {
  allowedActions: Record<string, boolean>;
  action: string;
  validTab: string | string[] | null;
  fn: () => Promise<FetchResult<T>>;
  tab?: string;
}): Promise<FetchResult<T>> => {
  return allowedActions[action] &&
    (!validTab ||
      (Array.isArray(validTab) && validTab.includes(tab)) ||
      tab === validTab)
    ? fn()
    : SUCCESS_200;
};

void ({} as GETResponse<unknown>);
