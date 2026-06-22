import type { SVG1DProps } from "@common/components/icons/types";

export const Leave = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={`0 0 20 20`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13 6.5V4.75C13 4.28587 12.8282 3.82819 12.5 3.5C12.1718 3.17181 11.7642 3 11.3001 3H2.75C2.28587 3 1.84075 3.18437 1.51256 3.51256C1.18437 3.84075 1 4.28587 1 4.75V15.25C1 15.7141 1.18437 16.1592 1.51256 16.4874C1.84075 16.8156 2.28587 17 2.75 17H11.3019C11.766 17 12.1718 16.8282 12.5 16.5C12.8282 16.1718 13 15.6321 13 15.168V13.5M15.7 6.5L19.2 10M19.2 10L15.7 13.5M19.2 10H7.25625"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
