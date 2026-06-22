import type { SVG1DProps } from "@common/components/icons/types";

export const Plus = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 20 20`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M9.99992 3.33334C10.4602 3.33334 10.8333 3.70644 10.8333 4.16668V15.8333C10.8333 16.2936 10.4602 16.6667 9.99992 16.6667C9.53968 16.6667 9.16658 16.2936 9.16658 15.8333V4.16668C9.16658 3.70644 9.53968 3.33334 9.99992 3.33334Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M3.33325 10C3.33325 9.53977 3.70635 9.16668 4.16659 9.16668H15.8333C16.2935 9.16668 16.6666 9.53977 16.6666 10C16.6666 10.4602 16.2935 10.8333 15.8333 10.8333H4.16659C3.70635 10.8333 3.33325 10.4602 3.33325 10Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
