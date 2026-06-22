"use client";

import { Toaster, toast } from "sonner";
import { useEffect, useRef } from "react";

import type { GlobalErrorProps } from "@/api/common/types";

// Lỗi ở root layout: toàn bộ provider + Toaster của app đã mất, nên dùng sonner
// thô (không phụ thuộc provider). Chỉ ghi log + bắn toast, trang để trống.
export default function GlobalError({ error }: GlobalErrorProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    console.error("[global-error-boundary]", error);
    toast.error("Đã xảy ra lỗi. Vui lòng tải lại trang.");
  }, [error]);

  return (
    <html lang="vi">
      <body className="bg-neutral-0 text-neutral-800">
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Đã có lỗi xảy ra. Vui lòng thử lại.
        </div>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
