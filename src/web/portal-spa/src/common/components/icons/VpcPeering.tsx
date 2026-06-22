import type { SVG1DProps } from "@common/components/icons/types";

export const VpcPeering = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M20.55 3H3.45C3.2016 3 3 3.2196 3 3.4905V7.9095C3 8.1804 3.2016 8.4 3.45 8.4H20.55C20.7984 8.4 21 8.1804 21 7.9095V3.4905C21 3.22005 20.7984 3 20.55 3ZM20.55 15.6H3.45C3.2016 15.6 3 15.8196 3 16.0905V20.5095C3 20.7804 3.2016 21 3.45 21H20.55C20.7984 21 21 20.7804 21 20.5095V16.0905C21 15.8196 20.7984 15.6 20.55 15.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.39922V12.0028L16.5 12.0073V15.5992M9.3 18.2992H14.7M9.3 5.69922H14.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
