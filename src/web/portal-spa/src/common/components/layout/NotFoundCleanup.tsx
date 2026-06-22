"use client";

import { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

function NotFoundCleanup() {
  const { updateKey } = useLayoutStore((state) => state);
  useEffect(() => {
    updateKey("isNotFound", false);
  }, []);
  return null;
}

export default NotFoundCleanup;
