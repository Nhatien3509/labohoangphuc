import type { SVG1DProps } from "@common/components/icons/types";

export const BackToTop = ({ size = 30, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.5">
        <rect
          x="0.75"
          y="0.75"
          width="28.5"
          height="28.5"
          rx="3.25"
          stroke="#EE0033"
          strokeWidth="1.5"
        />
        <path
          d="M15.0005 13.1379L8.10392 20.0345L9.06944 21L15.0005 15.069L20.9315 21L21.897 20.0345L15.0005 13.1379ZM6.72461 9H23.2763V10.3793H6.72461V9Z"
          fill="#3C3A3C"
        />
      </g>
    </svg>
  );
};
