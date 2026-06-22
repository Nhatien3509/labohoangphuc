"use client";

import { useEffect } from "react";
import { useUploadStore } from "@common/components/layout/providers/uploadStore";

export function useUploadUnloadGuard() {
  const hasActive = useUploadStore((s) => {
    // có item đang chạy?
    return Object.values(s.items).some(
      (it) => it.status === "queued" || it.status === "uploading",
    );
  });

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasActive) return;
      // Hiển thị prompt hệ thống của trình duyệt
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      e.returnValue = ""; // bắt buộc, dù bị mark deprecated
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [hasActive]);
}
