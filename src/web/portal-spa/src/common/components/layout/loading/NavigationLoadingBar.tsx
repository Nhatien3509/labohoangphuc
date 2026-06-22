"use client";

import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function NavigationLoadingBar() {
  const isNavigating = useLayoutStore((state) => state.isNavigating);

  return (
    <div
      aria-hidden={!isNavigating}
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden",
        isNavigating ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-full w-1/3 animate-navigating bg-primary-100 transition-all" />
    </div>
  );
}
