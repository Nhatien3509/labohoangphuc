import type { SVG1DProps } from "@common/components/icons/types";

export const DoubleArrowLeft = ({
  size = 16,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 16 16`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.33333 4.66669L4 8.00002L7.33333 11.3334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.3333 4.66669L8 8.00002L11.3333 11.3334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
