"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function NavigationStateSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNavigating = useLayoutStore((state) => state.isNavigating);
  const setIsNavigating = useLayoutStore((state) => state.setIsNavigating);
  const showGlobalLoading = useLayoutStore((state) => state.showGlobalLoading);
  const hideGlobalLoading = useLayoutStore((state) => state.hideGlobalLoading);
  const navHoldingRef = useRef(false);

  useEffect(() => {
    if (isNavigating && !navHoldingRef.current) {
      navHoldingRef.current = true;
      showGlobalLoading();
    } else if (!isNavigating && navHoldingRef.current) {
      navHoldingRef.current = false;
      hideGlobalLoading();
    }
  }, [isNavigating, showGlobalLoading, hideGlobalLoading]);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams, setIsNavigating]);

  return null;
}
