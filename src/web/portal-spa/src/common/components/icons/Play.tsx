import type { SVG1DProps } from "@common/components/icons/types";

export const Play = ({ size = 18, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      width={size}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15.6915 8.15882C16.3038 8.55246 16.3038 9.44754 15.6915 9.84118L5.31853 16.5095C4.65302 16.9373 3.77778 16.4595 3.77778 15.6683L3.77778 2.33167C3.77778 1.5405 4.65302 1.06266 5.31854 1.49049L15.6915 8.15882Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};
