import type { SVG1DProps } from "@common/components/icons/types";

export const CreditCard = ({ size = 24, className, ...props }: SVG1DProps) => {
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
      <g clipPath="url(#clip0_45802_22680)">
        <path
          d="M18.1667 4.5H4.83333C2.99238 4.5 1.5 5.99238 1.5 7.83333V16.7222C1.5 18.5632 2.99238 20.0556 4.83333 20.0556H18.1667C20.0076 20.0556 21.5 18.5632 21.5 16.7222V7.83333C21.5 5.99238 20.0076 4.5 18.1667 4.5Z"
          stroke="#575B5F"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M1.5 10.0544H21.5"
          stroke="#575B5F"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M5.94531 15.6111H5.95642"
          stroke="#575B5F"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M10.3877 15.6111H12.6099"
          stroke="#575B5F"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </g>
      <defs>
        <clipPath id="clip0_45802_22680">
          <rect fill="white" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
};
