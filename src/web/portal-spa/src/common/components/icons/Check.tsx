import type { SVG1DProps } from "@common/components/icons/types";

export const Check = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 18 19"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_59925_6225)">
        <path
          d="M3.75 9.5L7.5 13.25L15 5.75"
          stroke="currentColor"
          strokeWidth={props.strokeWidth ?? "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_59925_6225">
          <rect
            width="18"
            height="18"
            fill="currentColor"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
