import type { SVG1DProps } from "@common/components/icons/types";

export const Completed = ({ size = 16, className, ...props }: SVG1DProps) => {
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
      <path
        clipRule="evenodd"
        d="M8 0C3.5875 0 0 3.5875 0 8C0 12.4125 3.5875 16 8 16C12.4125 16 16 12.4125 16 8C16 3.5875 12.4125 0 8 0Z"
        fill="#028710"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M11.8691 5.30293C12.0629 5.49668 12.0629 5.81543 11.8691 6.00918L7.18164 10.6967C7.08477 10.7936 6.95664 10.8436 6.82852 10.8436C6.70039 10.8436 6.57227 10.7936 6.47539 10.6967L4.13164 8.35293C3.93789 8.15918 3.93789 7.84043 4.13164 7.64668C4.32539 7.45293 4.64414 7.45293 4.83789 7.64668L6.82852 9.6373L11.1629 5.30293C11.3566 5.10605 11.6754 5.10605 11.8691 5.30293Z"
        fill="#DCF0DE"
        fillRule="evenodd"
      />
    </svg>
  );
};
