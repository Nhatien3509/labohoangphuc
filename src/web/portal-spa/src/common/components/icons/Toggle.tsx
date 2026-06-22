import type { SVG1DProps } from "@common/components/icons/types";

export const Toggle = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M17 6H7C5.4087 6 3.88258 6.63214 2.75736 7.75736C1.63214 8.88258 1 10.4087 1 12C1 13.5913 1.63214 15.1174 2.75736 16.2426C3.88258 17.3679 5.4087 18 7 18H17C18.5913 18 20.1174 17.3679 21.2426 16.2426C22.3679 15.1174 23 13.5913 23 12C23 10.4087 22.3679 8.88258 21.2426 7.75736C20.1174 6.63214 18.5913 6 17 6Z"
        stroke="#3C3A3C"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
      <path
        d="M17 15C17.7956 15 18.5587 14.6839 19.1213 14.1213C19.6839 13.5587 20 12.7956 20 12C20 11.2044 19.6839 10.4413 19.1213 9.87868C18.5587 9.31607 17.7956 9 17 9C16.2044 9 15.4413 9.31607 14.8787 9.87868C14.3161 10.4413 14 11.2044 14 12C14 12.7956 14.3161 13.5587 14.8787 14.1213C15.4413 14.6839 16.2044 15 17 15Z"
        stroke="#3C3A3C"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
    </svg>
  );
};
