import type { SVG1DProps } from "@common/components/icons/types";

export const Calendar = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.9997 4.16797H4.99967C4.0792 4.16797 3.33301 4.91416 3.33301 5.83464V15.8346C3.33301 16.7551 4.0792 17.5013 4.99967 17.5013H14.9997C15.9201 17.5013 16.6663 16.7551 16.6663 15.8346V5.83464C16.6663 4.91416 15.9201 4.16797 14.9997 4.16797Z"
        stroke="#3C3A3C"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M13.333 2.5V5.83333"
        stroke="#3C3A3C"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.66699 2.5V5.83333"
        stroke="#3C3A3C"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3.33301 9.16797H16.6663"
        stroke="#3C3A3C"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.33366 12.5H6.66699V14.1667H8.33366V12.5Z"
        stroke="#3C3A3C"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
