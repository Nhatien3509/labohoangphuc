import type { SVG1DProps } from "@common/components/icons/types";

export const Back = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M9 14.5L5 10.5L9 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M5 10.5H16C17.0609 10.5 18.0783 10.9214 18.8284 11.6716C19.5786 12.4217 20 13.4391 20 14.5C20 15.5609 19.5786 16.5783 18.8284 17.3284C18.0783 18.0786 17.0609 18.5 16 18.5H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
