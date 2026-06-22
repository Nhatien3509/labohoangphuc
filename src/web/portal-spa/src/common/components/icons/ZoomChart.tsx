import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const ZoomChart = ({ size = 9, className, ...props }: SVG1DProps) => {
  return (
    <svg
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      width={size}
      {...props}
      className={cn("text-neutral-700", className)}
    >
      <path
        d="M4.5 8.4999L8.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M0.5 8.4998L8.5 0.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};
