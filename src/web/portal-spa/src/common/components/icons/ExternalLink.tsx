import type { SVG1DProps } from "@common/components/icons/types";

export const ExternalLink = ({
  size = 16,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.1944 0.75H14.9167M14.9167 0.75V5.47222M14.9167 0.75L6.25926 9.40741M12.5556 8.62037V13.3426C12.5556 13.7601 12.3897 14.1604 12.0945 14.4556C11.7993 14.7508 11.399 14.9167 10.9815 14.9167H2.32407C1.9066 14.9167 1.50623 14.7508 1.21104 14.4556C0.915839 14.1604 0.75 13.7601 0.75 13.3426V4.68519C0.75 4.26771 0.915839 3.86734 1.21104 3.57215C1.50623 3.27695 1.9066 3.11111 2.32407 3.11111H7.0463"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
