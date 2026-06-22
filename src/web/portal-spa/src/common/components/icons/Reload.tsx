import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const Reload = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={cn("text-neutral-700", className)}
      fill="none"
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 18 18"
    >
      <path
        d="M3 8.99995C3.00111 7.78425 3.35393 6.59483 4.0159 5.57516C4.67787 4.55549 5.62072 3.74912 6.73073 3.25332C7.84073 2.75752 9.07048 2.59346 10.2716 2.78093C11.4728 2.9684 12.5941 3.49939 13.5002 4.30986L15.6002 6.1999M3 16.0001V11.8H7.20008"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6005 2V6.20008H11.4004"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6002 9C15.5991 10.2157 15.2463 11.4051 14.5843 12.4248C13.9224 13.4445 12.9795 14.2508 11.8695 14.7466C10.7595 15.2424 9.52976 15.4065 8.3286 15.219C7.12744 15.0316 6.00617 14.5006 5.10004 13.6901L3 11.8001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
