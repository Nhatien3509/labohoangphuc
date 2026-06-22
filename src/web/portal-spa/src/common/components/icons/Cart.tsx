import type { SVG1DProps } from "@common/components/icons/types";

export const Cart = ({ size = 24, className, ...props }: SVG1DProps) => {
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
      <path
        d="M4.5 11.25H8.25M8.25 11.25V9M8.25 11.25H12M12 11.25V9M12 11.25H15.75M15.75 11.25V9M15.75 11.25H19.5M9.75 14.25H11.25M12.75 14.25H14.25M12.75 16.5H14.25M9.75 16.5H11.25M5.25 20.25V11.25H3.75V8.25L6 3.75H18L20.25 8.25V11.25H18.75V20.25H5.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
