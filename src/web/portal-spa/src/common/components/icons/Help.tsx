import type { SVG1DProps } from "@common/components/icons/types";

export const Help = ({ size = 16, className, ...props }: SVG1DProps) => {
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
      <g clipPath="url(#clip0_45455_16254)">
        <path
          d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 11.333V11.3397"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.00008 8.99978C7.98781 8.78337 8.04619 8.56882 8.16643 8.38846C8.28667 8.2081 8.46226 8.07169 8.66675 7.99978C8.91733 7.90396 9.14225 7.75128 9.32379 7.55375C9.50534 7.35623 9.63856 7.11927 9.71296 6.86151C9.78737 6.60375 9.80092 6.33225 9.75257 6.06836C9.70421 5.80448 9.59526 5.55542 9.43429 5.34079C9.27332 5.12617 9.06473 4.95184 8.82494 4.83153C8.58515 4.71122 8.32071 4.64821 8.05243 4.64747C7.78415 4.64672 7.51936 4.70826 7.27891 4.82724C7.03846 4.94622 6.8289 5.11939 6.66675 5.33312"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_45455_16254">
          <rect fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
};
