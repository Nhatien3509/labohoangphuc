import type { SVG1DProps } from "@common/components/icons/types";

export const Report = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20.5 6.5L12 1.5L3.5 6.5V16.5L12 21.5L20.5 16.5V6.5Z"
        stroke="#575B5F"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.9444 10.7222V15.1667M16.3889 8.5V15.1667M7.5 12.9444V15.1667"
        stroke="#575B5F"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
