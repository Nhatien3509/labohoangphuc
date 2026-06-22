import type { SVG1DProps } from "@common/components/icons/types";

export const Rescue = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.0004 15.6004C13.9886 15.6004 15.6004 13.9886 15.6004 12.0004C15.6004 10.0122 13.9886 8.40039 12.0004 8.40039C10.0122 8.40039 8.40039 10.0122 8.40039 12.0004C8.40039 13.9886 10.0122 15.6004 12.0004 15.6004Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.7002 9.29922L18.3002 5.69922M5.7002 18.2992L9.3002 14.6992M9.3002 9.29922L5.7002 5.69922M18.3002 18.2992L14.7002 14.6992"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};
