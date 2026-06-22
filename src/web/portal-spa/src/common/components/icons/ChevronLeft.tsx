import type { SVG1DProps } from "@common/components/icons/types";

export const ChevronLeft = ({ size = 20, className, ...props }: SVG1DProps) => {
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
      <path
        clipRule="evenodd"
        d="M13.0163 4.48408C13.301 4.76883 13.301 5.23052 13.0163 5.51527L8.53185 9.99967L13.0163 14.4841C13.301 14.7688 13.301 15.2305 13.0163 15.5153C12.7315 15.8 12.2698 15.8 11.9851 15.5153L6.98505 10.5153C6.7003 10.2305 6.7003 9.76883 6.98505 9.48408L11.9851 4.48408C12.2698 4.19932 12.7315 4.19932 13.0163 4.48408Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
