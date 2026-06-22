"use client";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Copy } from "@common/components/icons";

import * as React from "react";
import { cn } from "@common/lib/core/utils";
import { useCopyToClipboard } from "@/stories/mocks/useCopyToClipboard.mock";

export default function CopyContainer({
  message,
  size = 20,
  customClassName,
}: Readonly<{
  message: string;
  size?: number;
  customClassName?: string;
}>) {
  console.log("[SB MOCK] CopyContainer.stub loaded"); // kiểm tra alias có “ăn”
  const { handleCopy } = useCopyToClipboard();

  if (!message) return null;
  return (
    <IconWithTooltip
      tooltipProps={{
        content: "copy",
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
}
