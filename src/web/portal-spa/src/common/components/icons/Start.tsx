import type { SVG1DProps } from "@common/components/icons/types";

export const Start = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M5.5 11.9996V5.62365C5.5 3.64965 7.68 2.45365 9.344 3.51565L19.344 9.89165C20.885 10.8746 20.885 13.1246 19.344 14.1076L9.344 20.4836C7.68 21.5446 5.5 20.3496 5.5 18.3756V11.9996Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
