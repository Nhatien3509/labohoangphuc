import type { SVG1DProps } from "@common/components/icons/types";

export const Bucket = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="None"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="15.75" cy="17.0498" r="0.75" fill="currentColor" />
      <path
        d="M18.7349 17.1691C19.3483 17.1679 19.9548 16.9969 20.4704 16.6488C21.3906 16.0273 22 14.9443 22 13.7117C22 11.9836 20.8019 10.5492 19.2286 10.2693C19.1778 10.2602 19.1412 10.2139 19.1398 10.16C19.0426 6.46459 16.1536 3.5 12.6032 3.5C9.77485 3.5 7.36628 5.38152 6.45428 8.01495C6.43839 8.06088 6.3967 8.09031 6.35002 8.09027C3.94801 8.09027 2 10.1305 2 12.6473C2 15.0148 3.7233 16.9595 5.92712 17.182"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="6"
        y="14.5"
        width="12"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
