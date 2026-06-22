import type { SVG1DProps } from "@common/components/icons/types";

export const MoveOut = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 24 24`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.3333 3H20M20 3V8.66667M20 3L9.61111 13.3889M17.1667 12.4444V18.1111C17.1667 18.6121 16.9677 19.0925 16.6134 19.4468C16.2592 19.801 15.7787 20 15.2778 20H4.88889C4.38792 20 3.90748 19.801 3.55324 19.4468C3.19901 19.0925 3 18.6121 3 18.1111V7.72222C3 7.22126 3.19901 6.74081 3.55324 6.38658C3.90748 6.03234 4.38792 5.83333 4.88889 5.83333H10.5556"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
