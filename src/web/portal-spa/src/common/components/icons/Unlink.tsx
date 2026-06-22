import type { SVG1DProps } from "@common/components/icons/types";

export const Unlink = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M16 20V18.4M9.6 14.4L14.4 9.6M11.2 7.2L11.5704 6.7712C12.3206 6.02106 13.3382 5.59968 14.3991 5.59976C15.46 5.59983 16.4775 6.02136 17.2276 6.7716C17.9777 7.52184 18.3991 8.53935 18.399 9.60028C18.399 10.6612 17.9774 11.6787 17.2272 12.4288L16.8 12.8M12.8 16.8L12.4824 17.2272C11.7232 17.9774 10.6989 18.3981 9.6316 18.3981C8.5643 18.3981 7.54 17.9774 6.7808 17.2272C6.40649 16.8574 6.10931 16.417 5.90648 15.9314C5.70365 15.4459 5.59921 14.925 5.59921 14.3988C5.59921 13.8726 5.70365 13.3517 5.90648 12.8662C6.10931 12.3806 6.40649 11.9402 6.7808 11.5704L7.2 11.2M18.4 16H20M4 8H5.6M8 4V5.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
