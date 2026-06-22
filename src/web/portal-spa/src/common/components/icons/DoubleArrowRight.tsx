import type { SVG1DProps } from "@common/components/icons/types";

export const DoubleArrowRight = ({
  size = 16,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.6665 4.66669L7.99984 8.00002L4.6665 11.3334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.6665 4.66669L11.9998 8.00002L8.6665 11.3334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
