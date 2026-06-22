import type { SVG1DProps } from "@common/components/icons/types";

export const Unrescue = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M12.0005 15.5987C13.9883 15.5987 15.5996 13.9873 15.5996 11.9995C15.5996 10.0118 13.9883 8.40039 12.0005 8.40039C10.0128 8.40039 8.40137 10.0118 8.40137 11.9995C8.40137 13.9873 10.0128 15.5987 12.0005 15.5987Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.7 9.30031L18.2991 5.70117M5.70215 18.2981L9.30128 14.699M9.30128 9.30031L5.70215 5.70117M18.2991 18.2981L14.7 14.699"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.67162 3.30724C11.197 2.89698 12.8038 2.8976 14.3289 3.30904C19.1293 4.59573 21.9771 9.52925 20.6913 14.3287C19.4046 19.129 14.472 21.9769 9.67162 20.6911C4.87128 19.4053 2.02346 14.4718 3.30835 9.67141C3.71444 8.14481 4.51722 6.75283 5.63519 5.63678"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
