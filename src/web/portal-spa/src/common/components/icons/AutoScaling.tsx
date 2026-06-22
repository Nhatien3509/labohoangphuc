import type { SVG1DProps } from "@common/components/icons/types";

export const AutoScaling = ({ size = 48, className, ...props }: SVG1DProps) => {
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
        d="M42 6H26V9H36V12H39V22H42V6ZM36 12L31 14V17H28V20H31V17H34L36 12ZM17 31H20V28H17V31ZM17 31L12 33V36H15L17 31ZM9 26V36H12V39H9H22V42H6V26H9Z"
        fill="currentColor"
      />
    </svg>
  );
};
