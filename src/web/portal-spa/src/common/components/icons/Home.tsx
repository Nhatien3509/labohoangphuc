import type { SVG1DProps } from "@common/components/icons/types";

export function Home({ size = 16, className, ...props }: Readonly<SVG1DProps>) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_74798_769)">
        <path
          d="M0.666992 8.00033L8.00033 0.666992L15.3337 8.00033M14.0003 6.66699V13.3337C14.0003 13.6873 13.8598 14.0264 13.6098 14.2765C13.3598 14.5265 13.0206 14.667 12.667 14.667H3.33366C2.98004 14.667 2.6409 14.5265 2.39085 14.2765C2.1408 14.0264 2.00033 13.6873 2.00033 13.3337V6.66699M6.00033 14.667V9.33366H10.0003V14.667"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_74798_769">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
