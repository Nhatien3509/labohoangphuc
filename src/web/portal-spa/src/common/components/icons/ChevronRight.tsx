import type { SVG1DProps } from "@common/components/icons/types";

export const ChevronRight = ({
  size = 20,
  className,
  ...props
}: SVG1DProps) => {
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
        d="M6.98505 4.48408C7.26981 4.19932 7.73149 4.19932 8.01625 4.48408L13.0163 9.48408C13.301 9.76883 13.301 10.2305 13.0163 10.5153L8.01625 15.5153C7.73149 15.8 7.26981 15.8 6.98505 15.5153C6.7003 15.2305 6.7003 14.7688 6.98505 14.4841L11.4695 9.99967L6.98505 5.51527C6.7003 5.23052 6.7003 4.76883 6.98505 4.48408Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
