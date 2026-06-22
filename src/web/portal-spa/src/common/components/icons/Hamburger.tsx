import type { SVG1DProps } from "@common/components/icons/types";

export const Hamburger = ({ size = 24, ...props }: SVG1DProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 6.00098H21M3 12.001H21M3 18.001H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
