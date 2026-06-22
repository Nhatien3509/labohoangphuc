import type { SVG1DProps } from "@common/components/icons/types";

export const Stop = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M4 12C4 8.72 4 7.081 4.814 5.919C5.11507 5.48904 5.48904 5.11507 5.919 4.814C7.08 4 8.72 4 12 4C15.28 4 16.919 4 18.081 4.814C18.511 5.11507 18.8849 5.48904 19.186 5.919C20 7.08 20 8.72 20 12C20 15.28 20 16.919 19.186 18.081C18.8849 18.511 18.511 18.8849 18.081 19.186C16.92 20 15.28 20 12 20C8.72 20 7.081 20 5.919 19.186C5.48904 18.8849 5.11507 18.511 4.814 18.081C4 16.92 4 15.28 4 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
