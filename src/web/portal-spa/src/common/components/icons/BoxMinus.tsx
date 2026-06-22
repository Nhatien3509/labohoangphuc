import type { SVG1DProps } from "@common/components/icons/types";

export const BoxMinus = ({ size = 16, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 16 16"
    >
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="1.5"
        fill="currentColor"
      />
      <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="#575B5F" />
      <path d="M10.625 7.875H5.375H10.625Z" fill="black" />
      <path
        d="M10.625 7.875H5.375"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
