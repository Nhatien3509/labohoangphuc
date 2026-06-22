import type { SVG1DProps } from "@common/components/icons/types";

export function ArrowLeft({
  size = 24,
  className,
  ...props
}: Readonly<SVG1DProps>) {
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
        d="M4.16602 10H15.8327"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.16602 10L7.49935 13.3333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.16602 10.0003L7.49935 6.66699"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
