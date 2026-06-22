import Link from "next/link";

import React from "react";
import { cn } from "@common/lib/core/utils";

const I18nLinkTag =
  (
    {
      href,
      className,
      target,
    }: {
      href: string;
      className?: string;
      target?: React.HTMLAttributeAnchorTarget;
    } = { href: "" },
  ) =>
  (chunk: React.ReactNode) => (
    <Link
      href={href}
      target={target ?? "_blank"}
      className={cn("cursor-pointer text-primary-100 underline", className)}
    >
      {chunk}
    </Link>
  );

export default I18nLinkTag;
