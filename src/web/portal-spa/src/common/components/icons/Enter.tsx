import type { SVG1DProps } from "@common/components/icons/types";

export const Enter = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M8.25 8.5V6.75C8.25 6.28587 8.43291 5.84075 8.7585 5.51256C9.08408 5.18437 9.52567 5 9.98611 5H19.0139C19.4743 5 19.9159 5.18437 20.2415 5.51256C20.5671 5.84075 20.75 6.28587 20.75 6.75V17.25C20.75 17.7141 20.5671 18.1592 20.2415 18.4874C19.9159 18.8156 19.4743 19 19.0139 19H9.98611C9.52567 19 9.08408 18.8156 8.7585 18.4874C8.43291 18.1592 8.25 17.7141 8.25 17.25V15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 15.75L16.5 12L12.75 8.25M2.25 12H15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
