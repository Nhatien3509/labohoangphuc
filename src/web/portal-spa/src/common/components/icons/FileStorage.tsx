import type { SVG1DProps } from "@common/components/icons/types";

export const FileStorage = ({ size = 48, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.5 39H6V9H16.8L21.9 14.1L22.8 15H42V27H45V15C45 13.35 43.65 12 42 12H24L18.9 6.9C18.3 6.3 17.55 6 16.8 6H6C4.35 6 3 7.35 3 9V39C3 40.65 4.35 42 6 42H19.5V39ZM24 30H45V33H24V30ZM24 36H45V39H24V36ZM24 42H34.5V45H24V42Z"
        fill="currentColor"
      />
    </svg>
  );
};
