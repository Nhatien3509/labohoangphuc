import type { SVG1DProps } from "@common/components/icons/types";

export const Moon = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M20.9999 12.808C20.4999 18.155 15.1509 21.948 9.89294 20.791C-0.0780592 18.6 1.14994 3.909 11.1099 3C6.39494 9.296 14.6189 17.462 20.9999 12.808Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
