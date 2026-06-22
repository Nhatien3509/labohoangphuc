"use client";

import { useCallback } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export function useGlobalLoading() {
  const showGlobalLoading = useLayoutStore((state) => state.showGlobalLoading);
  const hideGlobalLoading = useLayoutStore((state) => state.hideGlobalLoading);

  const runWithLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      showGlobalLoading();
      try {
        return await fn();
      } finally {
        hideGlobalLoading();
      }
    },
    [showGlobalLoading, hideGlobalLoading],
  );

  return { showGlobalLoading, hideGlobalLoading, runWithLoading };
}
