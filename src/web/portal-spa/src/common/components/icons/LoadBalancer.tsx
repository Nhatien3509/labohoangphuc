import type { SVG1DProps } from "@common/components/icons/types";

export const LoadBalancer = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4 18.4286H6.57143V21H4V18.4286ZM10.4286 18.4286H13V21H10.4286V18.4286ZM16.8571 18.4286H19.4286V21H16.8571V18.4286ZM17.5 12H12.3571V9.42857H11.0714V12H5.92857C5.58758 12 5.26055 12.1355 5.01943 12.3766C4.77832 12.6177 4.64286 12.9447 4.64286 13.2857V17.1429H5.92857V13.2857H11.0714V17.1429H12.3571V13.2857H17.5V17.1429H18.7857V13.2857C18.7857 12.9447 18.6503 12.6177 18.4091 12.3766C18.168 12.1355 17.841 12 17.5 12ZM14.2857 8.14286V3H9.14286V8.14286H14.2857ZM10.4286 6.85714V4.28571H13V6.85714H10.4286Z"
        fill="currentColor"
      />
    </svg>
  );
};
