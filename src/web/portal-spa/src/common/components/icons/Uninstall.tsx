import type { SVG1DProps } from "@common/components/icons/types";

export const Uninstall = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M15 8.5V6.75C15 6.28587 14.8282 5.82819 14.5 5.5C14.1718 5.17181 13.7642 5 13.3001 5H4.75C4.28587 5 3.84075 5.18437 3.51256 5.51256C3.18437 5.84075 3 6.28587 3 6.75V17.25C3 17.7141 3.18437 18.1592 3.51256 18.4874C3.84075 18.8156 4.28587 19 4.75 19H13.3019C13.766 19 14.1718 18.8282 14.5 18.5C14.8282 18.1718 15 17.6321 15 17.168V15.5M17.7 8.5L21.2 12M21.2 12L17.7 15.5M21.2 12H9.25625"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
