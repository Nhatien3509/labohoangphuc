import {
  type FlattenError,
  HandleErrorMessage,
} from "@common/components/containers/ErrorToast";
import GNotification, {
  type GNotificationVariant,
} from "@common/components/feedback/GNotification";
import { type ApiError } from "@/api/types";
import { type ReactNode } from "react";
import { XToaster } from "@common/components/icons";
import { toast as sonner } from "sonner";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type ToastStatus = "success" | "failed" | "info";

const toast = (description: ReactNode) =>
  sonner.custom((id) => (
    <ToastCustom
      {...{
        id,
        description,
        status: "success",
      }}
    />
  ));

toast.success = toast;

toast.error = (description: ReactNode) =>
  sonner.custom((id) => (
    <ToastCustom
      {...{
        id,
        description,
        status: "failed",
      }}
    />
  ));

toast.info = (description: ReactNode) =>
  sonner.custom((id) => (
    <ToastCustom
      {...{
        id,
        description,
        status: "info",
      }}
    />
  ));

toast.customError = (
  data?: ApiError | FlattenError[],
  statusCode?: number,
  statusText?: string,
) =>
  sonner.custom((id) => (
    <ToastCustom
      {...{
        id,
        description: (
          <HandleErrorMessage
            data={data}
            statusCode={statusCode}
            statusText={statusText}
          />
        ),
        status: "failed",
      }}
    />
  ));

const STATUS_TO_VARIANT: Record<ToastStatus, GNotificationVariant> = {
  success: "success",
  failed: "error",
  info: "success",
};

const ToastCustom = ({
  id,
  description,
  status = "success",
}: {
  id: string | number;
  description: ReactNode;
  status?: ToastStatus;
}) => {
  const { t } = useLayoutStore((state) => state);

  return (
    <div className="relative w-[18.75rem]" data-testid={`toast-${status}`}>
      <GNotification
        variant={STATUS_TO_VARIANT[status]}
        title={t(`common.toast.${status}`)}
        description={description}
      />
      <button
        onClick={() => sonner.dismiss(id)}
        className="absolute right-2 top-2 text-neutral-800"
        aria-label="Close"
      >
        <XToaster />
      </button>
    </div>
  );
};

export default toast;
