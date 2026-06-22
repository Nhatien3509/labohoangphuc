import type { SVG1DProps } from "@common/components/icons/types";

export const Loading = ({ size = 18, className, ...props }: SVG1DProps) => {
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
        d="M12 5C15.866 5 19 8.13401 19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5Z"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M12 5C15.866 5 19 8.13401 19 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
};
