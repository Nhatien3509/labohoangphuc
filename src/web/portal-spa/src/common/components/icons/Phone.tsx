import type { SVG1DProps } from "@common/components/icons/types";

export const Phone = ({ size = 18, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.75 14.0062C11.1975 14.6287 12.9315 15 15 15V12L12 11.25L9.75 14.0062ZM9.75 14.0062C6.86925 12.7672 5.118 10.5338 4.125 8.25M4.125 8.25C3.3 6.354 3 4.4235 3 3H6L6.75 6L4.125 8.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
