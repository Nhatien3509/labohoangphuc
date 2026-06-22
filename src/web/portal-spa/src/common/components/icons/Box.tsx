import type { SVG1DProps } from "@common/components/icons/types";

export const Box = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="1.5"
        fill="white"
        stroke="currentColor"
      />
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="1.5"
        stroke="currentColor"
      />
    </svg>
  );
};
