import type { SVG1DProps } from "@common/components/icons/types";

export const DragVerticalVariant = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 12 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 36H9V12H11V36ZM15 12H13V36H15V12Z" fill="currentColor" />
    </svg>
  );
};
