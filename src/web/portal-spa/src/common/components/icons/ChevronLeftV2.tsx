import type { SVG1DProps } from "@common/components/icons/types";

export const ChevronLeftV2 = ({
  size = 22,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 22 22"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2413 19.626L6.274 11.6444C6.20229 11.5759 6.14538 11.4934 6.10678 11.402C6.06819 11.3106 6.04873 11.2123 6.0496 11.1131C6.04931 10.9084 6.12998 10.7119 6.274 10.5664C9.156 7.75483 11.9335 5.04113 14.6065 2.42533C14.744 2.29663 15.294 1.97653 15.7186 2.45173C16.1432 2.92803 15.8858 3.34273 15.7186 3.51433L7.9438 11.1131L15.3655 18.548C15.6361 18.9209 15.6141 19.2652 15.2995 19.5809C14.9849 19.8966 14.6318 19.912 14.2413 19.626Z"
        fill="currentColor"
      />
    </svg>
  );
};
