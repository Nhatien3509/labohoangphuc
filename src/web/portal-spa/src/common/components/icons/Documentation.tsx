import type { SVG1DProps } from "@common/components/icons/types";

export const Documentation = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 2.75H8C6.067 2.75 4.5 4.317 4.5 6.25V17.75C4.5 19.683 6.067 21.25 8 21.25H16C17.933 21.25 19.5 19.683 19.5 17.75V6.25C19.5 4.317 17.933 2.75 16 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 6.75488H15.5M8.5 10.7549H15.5M8.5 14.7549H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
