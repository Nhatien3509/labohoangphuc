import type { SVG1DProps } from "@common/components/icons/types";

export const ToggleOff = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M7.5 18L17.5 18C19.0913 18 20.6174 17.3679 21.7426 16.2426C22.8679 15.1174 23.5 13.5913 23.5 12C23.5 10.4087 22.8679 8.88258 21.7426 7.75736C20.6174 6.63214 19.0913 6 17.5 6L7.5 6C5.9087 6 4.38258 6.63214 3.25736 7.75736C2.13214 8.88258 1.5 10.4087 1.5 12C1.5 13.5913 2.13214 15.1174 3.25736 16.2426C4.38258 17.3679 5.9087 18 7.5 18Z"
        stroke="#3C3A3C"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9C6.70435 9 5.94129 9.31607 5.37868 9.87868C4.81607 10.4413 4.5 11.2044 4.5 12C4.5 12.7956 4.81607 13.5587 5.37868 14.1213C5.94129 14.6839 6.70435 15 7.5 15C8.29565 15 9.05871 14.6839 9.62132 14.1213C10.1839 13.5587 10.5 12.7956 10.5 12C10.5 11.2044 10.1839 10.4413 9.62132 9.87868C9.05871 9.31607 8.29565 9 7.5 9Z"
        stroke="#3C3A3C"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
    </svg>
  );
};
