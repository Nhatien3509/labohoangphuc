import type { SVG1DProps } from "@common/components/icons/types";

export const WebProtection = ({
  size = 48,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 48 48"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M45 27V35.25C45 37.5 43.65 39.45 41.55 40.5L39 41.7L36.45 40.5C34.35 39.6 33 37.5 33 35.25V27H45ZM48 24H30V35.25C30 38.55 31.95 41.7 35.1 43.2L39 45L42.9 43.2C46.05 41.7 48 38.7 48 35.25V24Z"
        fill="currentColor"
      />
      <path
        d="M24 37.5H11.25C5.1 37.5 0 32.4 0 26.25C0 20.7 4.05 16.2 9.3 15.15C10.65 8.1 16.8 3 24 3C32.25 3 39 9.75 39 18H36C36 11.4 30.6 6 24 6C17.85 6 12.75 10.65 12 16.65V18H10.65C6.3 18.3 3 21.9 3 26.25C3 30.75 6.75 34.5 11.25 34.5H24V37.5Z"
        fill="currentColor"
      />
    </svg>
  );
};
