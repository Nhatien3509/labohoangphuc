import type { SVG1DProps } from "@common/components/icons/types";

export const Radio = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="white" />
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="9.5"
        stroke="currentColor"
      />
    </svg>
  );
};
