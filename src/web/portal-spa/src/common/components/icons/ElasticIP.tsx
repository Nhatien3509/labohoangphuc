import type { SVG1DProps } from "@common/components/icons/types";

export const ElasticIP = ({ size = 48, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M28 36H25V13H34.8889C36.6047 13 38 14.3243 38 16.1364V25C38 26.8121 36.7158 28 35 28H28V36ZM28 25H35V16H28V25ZM10 16H14V33H10V36H21V33H17V16H21V13H10V16Z"
        fill="currentColor"
      />
    </svg>
  );
};
