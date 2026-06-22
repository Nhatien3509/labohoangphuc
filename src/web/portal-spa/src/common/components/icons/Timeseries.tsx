import type { SVG1DProps } from "@common/components/icons/types";

export const Timeseries = ({ size = 30, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.0313 9.375V11.25H25.8617L14.7657 22.3461L10.547 18.1273L4.49341 24.1808L5.81927 25.5067L10.547 20.7789L14.7657 24.9977L27.1876 12.5759V16.4062H29.0626V9.375H22.0313Z"
        fill="currentColor"
      />
      <path
        d="M2.8125 6.09375H0.9375V29.0625H29.0625V27.1875H2.8125V6.09375Z"
        fill="currentColor"
      />
    </svg>
  );
};
