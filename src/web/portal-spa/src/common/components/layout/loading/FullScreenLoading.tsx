"use client";

import Lottie from "lottie-react";
import blueLoading from "@common/components/layout/loading/blue-loading.json";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function FullScreenLoading() {
  const isGlobalLoading = useLayoutStore((state) => state.isGlobalLoading);

  if (!isGlobalLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải"
      className="dark:bg-neutral-dark-0/40 fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-[2px]"
    >
      <Lottie
        animationData={blueLoading}
        loop
        autoplay
        className="h-[160px] w-[160px]"
      />
    </div>
  );
}
