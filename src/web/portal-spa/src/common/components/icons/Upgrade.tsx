import { BaseIcon } from "./BaseIcon";
import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const Upgrade = ({
  size = 24,
  viewBox = "0 0 24 24",
  className,
  ...props
}: SVG1DProps) => (
  <BaseIcon
    size={size}
    viewBox={viewBox}
    className={cn(className, "text-neutral-700")}
    {...props}
  >
    <path
      d="M6 18L12 12L18 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12L12 6L18 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);
