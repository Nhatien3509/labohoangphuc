import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const Spinner = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={cn("animate-spin", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
