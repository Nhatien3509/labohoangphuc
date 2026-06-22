"use client";

import ErrorBoundaryToast from "@common/components/layout/errors/ErrorBoundaryToast";

import type { GlobalErrorProps } from "@/api/common/types";

// Bỏ màn lỗi full-screen: chỉ bắn toast + ghi log, trang để trống. Toaster nằm
// trong MinimalLayoutProvider (bọc error boundary này) nên toast hiển thị được.
export default function Error({ error }: GlobalErrorProps) {
  return <ErrorBoundaryToast error={error} logSource="segment-error-boundary" />;
}
