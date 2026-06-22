"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { BASE_PATH } from "@common/lib/core/const";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export const useReturnUrl = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {
    url: { CONSOLE_URL },
  } = useLayoutStore((state) => state);

  const getCurrentUrl = () => {
    const params = searchParams.toString();
    return [CONSOLE_URL, BASE_PATH, pathname, params && `?${params}`]
      .filter(Boolean)
      .join("");
  };

  const getReturnUrl = (path: string) => {
    return `${path}?returnUrl=${encodeURIComponent(getCurrentUrl())}`;
  };

  return { getReturnUrl };
};
