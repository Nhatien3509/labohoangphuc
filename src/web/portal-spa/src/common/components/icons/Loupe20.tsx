import type { SVG1DProps } from "@common/components/icons/types";

export const Loupe20 = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      height={size}
      viewBox="0 0 20 20"
      width={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.3333 13.3333L16 16M4 9.33333C4 10.7478 4.5619 12.1044 5.5621 13.1046C6.56229 14.1048 7.91885 14.6667 9.33333 14.6667C10.7478 14.6667 12.1044 14.1048 13.1046 13.1046C14.1048 12.1044 14.6667 10.7478 14.6667 9.33333C14.6667 7.91885 14.1048 6.56229 13.1046 5.5621C12.1044 4.5619 10.7478 4 9.33333 4C7.91885 4 6.56229 4.5619 5.5621 5.5621C4.5619 6.56229 4 7.91885 4 9.33333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
