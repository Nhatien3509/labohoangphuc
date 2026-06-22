import type { SVG1DProps } from "@common/components/icons/types";

export const Chart = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22 2.5H2V8.5H22V2.5Z"
        stroke="#3C3A3C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2 20.515L8.088 14.365L11.3775 17.515L15.399 13.5L17.639 15.684"
        stroke="#3C3A3C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 8.08555V21.0855M2 8.08555V15.0855M6.508 21.4995H22M8.5 5.49955H19M5 5.49805H5.5"
        stroke="#3C3A3C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
