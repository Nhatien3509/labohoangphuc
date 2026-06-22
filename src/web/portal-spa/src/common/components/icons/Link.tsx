import type { SVG1DProps } from "@common/components/icons/types";

export const Link = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 18 18"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.03223 10.9694L10.9704 7.03125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.34277 5.06293L8.64667 4.71112C9.26221 4.09566 10.097 3.74994 10.9675 3.75C11.8379 3.75006 12.6727 4.0959 13.2881 4.71144C13.9036 5.32699 14.2493 6.1618 14.2493 7.03225C14.2492 7.90269 13.9034 8.73746 13.2878 9.35292L12.9373 9.65747"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.65736 12.9383L9.39678 13.2888C8.77406 13.9046 7.93361 14.25 7.05784 14.25C6.18206 14.25 5.34161 13.9046 4.71888 13.2888C4.41194 12.9853 4.16826 12.6239 4.00195 12.2256C3.83564 11.8272 3.75 11.3999 3.75 10.9682C3.75 10.5366 3.83564 10.1092 4.00195 9.71086C4.16826 9.31253 4.41194 8.95115 4.71888 8.64765L5.06282 8.34375"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
