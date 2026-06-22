import AppLink from "@common/components/containers/AppLink";
import type Link from "next/link";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@common/lib/core/utils";

type HyperlinkProps = {
  content: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  customClassName?: string;
} & ComponentProps<typeof Link>;

const Hyperlink = ({
  content,
  href,
  leftIcon,
  rightIcon,
  customClassName,
  target,
  ...props
}: HyperlinkProps) => {
  return (
    <AppLink
      target={target}
      className={cn(
        "w-fit text-base font-normal text-primary-100 underline underline-offset-[0.1875rem]",
        "base-transition hover:font-semibold hover:text-primary-200",
        leftIcon ?? (rightIcon && "flex gap-3"),
        customClassName,
      )}
      href={href}
      {...props}
    >
      <div>{leftIcon}</div>
      {content}
      <div>{rightIcon}</div>
    </AppLink>
  );
};

export default Hyperlink;
