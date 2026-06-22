import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const Pause = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={cn("text-neutral-700", className)}
      fill="none"
      height={size}
      width={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="16"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="16"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
