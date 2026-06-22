import type { SVG1DProps } from "@common/components/icons/types";

export const Human = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M18.8439 7.875C18.7065 9.78141 17.2923 11.25 15.7501 11.25C14.2079 11.25 12.7914 9.78188 12.6564 7.875C12.5157 5.89172 13.8925 4.5 15.7501 4.5C17.6078 4.5 18.9845 5.92781 18.8439 7.875Z"
        stroke="#575B5F"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15.7498 14.25C12.695 14.25 9.75731 15.7673 9.02138 18.7223C8.92388 19.1133 9.16903 19.5 9.57075 19.5H21.9293C22.3311 19.5 22.5748 19.1133 22.4787 18.7223C21.7428 15.72 18.8051 14.25 15.7498 14.25Z"
        stroke="#575B5F"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
      <path
        d="M9.37496 8.71594C9.26527 10.2384 8.12246 11.4375 6.89058 11.4375C5.65871 11.4375 4.51402 10.2389 4.40621 8.71594C4.29418 7.13203 5.40652 6 6.89058 6C8.37465 6 9.48699 7.16109 9.37496 8.71594Z"
        stroke="#575B5F"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.65622 14.3437C8.81013 13.9561 7.87825 13.807 6.8906 13.807C4.4531 13.807 2.10466 15.0187 1.51638 17.3789C1.43903 17.6911 1.63497 18 1.9556 18H7.21872"
        stroke="#575B5F"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
    </svg>
  );
};
