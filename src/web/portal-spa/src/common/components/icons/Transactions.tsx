import type { SVG1DProps } from "@common/components/icons/types";

export const Transactions = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
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
        d="M4 19V8H20V11.29C20.72 11.51 20.9 11.57 21.5 12V8C21.5 6.89 21.11 6.5 20 6.5H15.5V4C15.5 2.89 15.11 2.5 14 2.5H10C8.89 2.5 8.5 2.89 8.5 4V6.5H4C2.89 6.5 2.5 6.89 2.5 8V19C2.5 20.11 2.89 20.5 4 20.5H11.5C11.5 20 11.5 19.5 11.08 19H4ZM10 4H14V6.5H10V4Z"
        fill="#575B5F"
      />
      <path
        d="M18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C20.76 23 23 20.76 23 18C23 15.24 20.76 13 18 13ZM19.65 20.35L17.5 18.2V15H18.5V17.79L20.35 19.64L19.65 20.35Z"
        fill="#575B5F"
      />
    </svg>
  );
};
