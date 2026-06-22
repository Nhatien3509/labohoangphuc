"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { BASE_PATH } from "@common/lib/core/const";
import toast from "@common/components/ui/toast";
import { useFeatureFlag } from "@common/hooks/useFeatureFlags";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const ERROR_LOGS_URI = `${BASE_PATH}/api/error-logs`;

type LoggedError = Error & { digest?: string };

export type ErrorBoundaryToastProps = {
  error?: LoggedError;
  logSource: string;
  /** Ghi đè nội dung toast; mặc định lấy từ i18n `common.errors.server-errors`. */
  message?: ReactNode;
};

function serializeError(error: LoggedError) {
  return {
    digest: typeof error.digest === "string" ? error.digest : undefined,
    message: error.message || "Unknown error",
    name: error.name || "Error",
    stack: error.stack,
  };
}

async function sendError(payload: unknown) {
  try {
    const res = await fetch(ERROR_LOGS_URI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: "no-store",
    });
    if (!res.ok) console.error("[error-logger] Failed to persist error log");
  } catch (err) {
    console.error("[error-logger] Network error", err);
  }
}

/**
 * Thay cho màn lỗi full-screen: chỉ ghi log lỗi (console + tùy chọn POST khi bật
 * debugLogs) rồi bắn 1 toast, KHÔNG render UI (trang để trống). Dùng trong các
 * error boundary có sẵn LayoutStoreProvider + Toaster ([locale]/error.tsx) và ở
 * PageGenerator (lỗi fetch -1).
 */
export default function ErrorBoundaryToast({
  error,
  logSource,
  message,
}: Readonly<ErrorBoundaryToastProps>) {
  const { t } = useLayoutStore((state) => state);
  const isDebugLogsEnabled = useFeatureFlag("debugLogs.enabled");
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const loggableError =
      error ??
      new Error(`${logSource} rendered without explicit error details`);

    console.error(`[${logSource}]`, loggableError);

    if (isDebugLogsEnabled) {
      void sendError({
        ...serializeError(loggableError),
        pathname: globalThis.location.pathname,
        source: logSource,
        timestamp: new Date().toISOString(),
        userAgent: globalThis.navigator.userAgent,
      });
    }

    toast.error(message ?? t("common.errors.server-errors.description"));
  }, [error, isDebugLogsEnabled, logSource, message, t]);

  return (
    <div className="flex w-full flex-1 items-center justify-center px-6 py-16 text-center">
      <p className="text-[13px] leading-[18px] text-neutral-500 dark:text-neutral-dark-500">
        Đã có lỗi xảy ra. Vui lòng thử lại.
      </p>
    </div>
  );
}
