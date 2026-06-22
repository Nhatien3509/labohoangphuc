import type { SVG1DProps } from "@common/components/icons/types";

export const SyncConfig = ({
  size = 24,
  className = "text-neutral-700",
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
        d="M15 3.5L15 3.8C15 4.92011 15 5.48016 15.218 5.90798C15.4097 6.28431 15.7157 6.59027 16.092 6.78201C16.5198 7 17.0799 7 18.2 7H18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="9"
        y="11.5"
        width="13"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.6091 19.0641C18.2653 19.7313 17.7167 20.2737 17.0419 20.6136C16.7059 20.7828 16.2819 20.888 15.5971 20.9433C14.9026 20.9994 14.0152 21 12.7655 21H9.23448C7.98485 21 7.0974 20.9994 6.4029 20.9433C5.71807 20.888 5.29407 20.7828 4.9581 20.6136C4.28331 20.2737 3.73469 19.7313 3.39087 19.0641C3.21969 18.732 3.11334 18.3128 3.05739 17.6358C3.00064 16.9492 3 16.0718 3 14.8364V9.16364C3 7.9282 3.00064 7.05083 3.05739 6.36423C3.11334 5.68719 3.21969 5.268 3.39087 4.93585C3.73469 4.26873 4.28331 3.72635 4.9581 3.38643C5.29407 3.21719 5.71807 3.11205 6.4029 3.05673C7.0974 3.00064 7.98485 3 9.23448 3H12.7655C14.0152 3 14.9026 3.00064 15.5971 3.05673C16.2819 3.11205 16.7059 3.21719 17.0419 3.38643C17.7167 3.72635 18.2653 4.26873 18.6091 4.93585C18.7803 5.268 18.8867 5.68719 18.9426 6.36423C18.9994 7.05083 19 7.9282 19 9.16364"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
