import type { SVG1DProps } from "@common/components/icons/types";

export const ChevronUp = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        clipRule="evenodd"
        d="M11.3813 8.38128C11.723 8.03957 12.277 8.03957 12.6187 8.38128L18.6187 14.3813C18.9604 14.723 18.9604 15.277 18.6187 15.6187C18.277 15.9604 17.723 15.9604 17.3813 15.6187L12 10.2374L6.61872 15.6187C6.27701 15.9604 5.72299 15.9604 5.38128 15.6187C5.03957 15.277 5.03957 14.723 5.38128 14.3813L11.3813 8.38128Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
