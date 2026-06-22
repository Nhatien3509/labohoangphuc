import type { SVG1DProps } from "@common/components/icons/types";

export const Cluster = ({ size = 24, className, ...props }: SVG1DProps) => {
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
      <circle
        cx="11.5002"
        cy="12.5959"
        r="2.2619"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="18.7385"
        cy="18.4767"
        r="2.2619"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="5.61812"
        cy="18.9287"
        r="1.80952"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="19.1904"
        cy="8.52437"
        r="1.80952"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="11.5005"
        cy="6.71336"
        r="0.904762"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="4.71429"
        cy="6.71429"
        rx="2.71429"
        ry="2.71429"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.52344 8.52344L9.6901 11.0568M17.3806 17.1187L13.3092 13.952"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.97656 17.571L10.1432 14.4043"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.8324 9.42773L13.3086 11.2373"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11.5 7.61914V10.3334" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};
