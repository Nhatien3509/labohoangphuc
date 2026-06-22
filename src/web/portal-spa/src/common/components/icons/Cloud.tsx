import type { SVG1DProps } from "@common/components/icons/types";

export const Cloud = ({ size = 18, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.2 8.1375C12.9291 5.40933 11.0367 3.75 8.8125 3.75C6.71016 3.75 5.35613 5.21859 4.9125 6.675C3.08438 6.85781 1.5 8.00313 1.5 10.0875C1.5 12.0984 3.14531 13.5 5.15625 13.5H13.0781C14.7539 13.5 16.125 12.6639 16.125 10.8188C16.125 8.99611 14.5102 8.20575 13.2 8.1375Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
