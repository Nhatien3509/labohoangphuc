"use client";

import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Copy } from "@common/components/icons";

import React from "react";
import { cn } from "@common/lib/core/utils";
import { useCopyToClipboard } from "@common/hooks/useCopyToClipboard";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type CopyContainerProps = {
  message: string;
  size?: number;
  customClassName?: string;
};

const CopyContainer = ({
  message,
  customClassName,
  size = 24,
}: CopyContainerProps) => {
  const { t } = useLayoutStore((state) => state);
  const { handleCopy } = useCopyToClipboard();

  if (!message) return null;

  return (
    <IconWithTooltip
      tooltipProps={{
        content: t("common.actions.copy"),
      }}
    >
      <Copy
        className={cn(
          "cursor-pointer text-neutral-700 hover:text-primary-200 active:text-primary-200 group-hover:text-primary-200 group-hover:dark:text-primary-200",
          customClassName,
        )}
        size={size}
        onClick={() => {
          handleCopy(message).catch(console.error);
        }}
      />
    </IconWithTooltip>
  );
};

export default CopyContainer;
