import type { SVG1DProps } from "@common/components/icons/types";

export const BaseIcon = ({
  size = 24,
  className,
  children,
  viewBox = "0 0 24 24",
  ...props
}: SVG1DProps & { children: React.ReactNode }) => (
  <svg
    className={className}
    fill="none"
    height={size}
    width={size}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);
