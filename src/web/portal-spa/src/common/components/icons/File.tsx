import type { SVG1DProps } from "@common/components/icons/types";

export const File = ({
  width = 16,
  height = 16,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 12.6673C14 13.7719 13.1046 14.6673 12 14.6673H4C2.89543 14.6673 2 13.7719 2 12.6673V3.33398C2 2.22941 2.89543 1.33398 4 1.33398H10.6667L10.6738 1.34112C11.1424 1.38082 11.5841 1.58472 11.9191 1.91977L13.4142 3.41487C13.7493 3.74992 13.9532 4.19162 13.9929 4.66018L14 4.66732V12.6673ZM12 13.334H4C3.63181 13.334 3.33333 13.0355 3.33333 12.6673V3.33398C3.33333 2.96579 3.63181 2.66732 4 2.66732H10V4.00065C10 4.73703 10.597 5.33398 11.3333 5.33398H12.6667V12.6673C12.6667 13.0355 12.3682 13.334 12 13.334Z"
        fill="currentColor"
      />
    </svg>
  );
};
