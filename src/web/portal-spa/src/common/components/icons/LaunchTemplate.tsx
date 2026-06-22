import type { SVG1DProps } from "@common/components/icons/types";

export const LaunchTemplate = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.5 20H20V19.5V12.5H20.5V19C20.5 19.8239 19.8239 20.5 19 20.5H5C4.60218 20.5 4.22064 20.342 3.93934 20.0607C3.65804 19.7794 3.5 19.3978 3.5 19V5C3.5 4.60218 3.65804 4.22064 3.93934 3.93934C4.22064 3.65804 4.60218 3.5 5 3.5H11.5V4H4.5H4V4.5V19.5V20H4.5H19.5ZM20 9.5V5.5V4.29289L19.1464 5.14645L9 15.2929L8.70711 15L18.8536 4.85355L19.7071 4H18.5H14.5V3.5H20.5V9.5H20Z"
        fill="currentColor"
        stroke="currentColor"
      />
    </svg>
  );
};
