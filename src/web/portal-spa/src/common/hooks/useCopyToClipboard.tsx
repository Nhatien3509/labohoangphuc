import toast from "@common/components/ui/toast";

import { copyToClipboard } from "@common/lib/helpers/clipboard";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export const useCopyToClipboard = () => {
  const { t } = useLayoutStore((state) => state);

  const handleCopy = async (
    content: string,
    messages?: { success?: string; fail?: string },
  ) => {
    // copyToClipboard có fallback execCommand cho HTTP context (navigator.clipboard
    // chỉ chạy trên HTTPS/localhost).
    const ok = await copyToClipboard(content);
    if (ok) {
      toast(messages?.success ?? t("common.actions.copy_successfully"));
    } else {
      toast.error(messages?.fail ?? t("common.actions.copy_failed"));
    }
  };

  return { handleCopy };
};
