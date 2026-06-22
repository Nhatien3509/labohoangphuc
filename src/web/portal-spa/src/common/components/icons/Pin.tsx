import type { SVG1DProps } from "@common/components/icons/types";

export const Pin = ({
  size = 24,
  className = "text-neutral-700",
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
    >
      <path
        d="M10.3194 13.6807L5 19.0001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.63672 9.57641L14.16 17.0997L15.5488 15.711L15.2272 12.6118L19.7365 8.7875L14.949 4L11.1239 8.50925L8.0255 8.18763L6.63672 9.57641Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
