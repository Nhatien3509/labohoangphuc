import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const Logs = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={cn("text-neutral-700", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.75 1.25L12.75 1.55C12.75 2.67011 12.75 3.23016 12.968 3.65798C13.1597 4.03431 13.4657 4.34027 13.842 4.53201C14.2698 4.75 14.8299 4.75 15.95 4.75H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="6.75"
        y="9.25"
        width="13"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.3591 16.8141C16.0153 17.4813 15.4667 18.0237 14.7919 18.3636C14.4559 18.5328 14.0319 18.638 13.3471 18.6933C12.6526 18.7494 11.7652 18.75 10.5155 18.75H6.98448C5.73485 18.75 4.8474 18.7494 4.1529 18.6933C3.46807 18.638 3.04407 18.5328 2.7081 18.3636C2.03331 18.0237 1.48469 17.4813 1.14087 16.8141C0.969688 16.482 0.863339 16.0628 0.807386 15.3858C0.750644 14.6992 0.75 13.8218 0.75 12.5864V6.91364C0.75 5.6782 0.750644 4.80083 0.807386 4.11423C0.863339 3.43719 0.969688 3.018 1.14087 2.68585C1.48469 2.01873 2.03331 1.47635 2.7081 1.13643C3.04407 0.967192 3.46807 0.862051 4.1529 0.806734C4.8474 0.750636 5.73485 0.75 6.98448 0.75H10.5155C11.7652 0.75 12.6526 0.750636 13.3471 0.806734C14.0319 0.862051 14.4559 0.967192 14.7919 1.13643C15.4667 1.47635 16.0153 2.01873 16.3591 2.68585C16.5303 3.018 16.6367 3.43719 16.6926 4.11423C16.7494 4.80083 16.75 5.6782 16.75 6.91364"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
