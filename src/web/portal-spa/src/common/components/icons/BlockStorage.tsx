import type { SVG1DProps } from "@common/components/icons/types";

export const BlockStorage = ({
  size = 48,
  className,
  ...props
}: SVG1DProps) => {
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
        d="M42 30H39V33H42V42H6V33H9V30H6C5.20435 30 4.44129 30.3161 3.87868 30.8787C3.31607 31.4413 3 32.2044 3 33V42C3 42.7956 3.31607 43.5587 3.87868 44.1213C4.44129 44.6839 5.20435 45 6 45H42C42.7957 45 43.5587 44.6839 44.1213 44.1213C44.6839 43.5587 45 42.7956 45 42V33C45 32.2044 44.6839 31.4413 44.1213 30.8787C43.5587 30.3161 42.7957 30 42 30Z"
        fill="currentColor"
      />
      <path
        d="M10.5 39C11.3284 39 12 38.3284 12 37.5C12 36.6716 11.3284 36 10.5 36C9.67157 36 9 36.6716 9 37.5C9 38.3284 9.67157 39 10.5 39Z"
        fill="currentColor"
      />
      <path
        d="M23 30H13V20H23V30ZM16 27H20V23H16V27ZM36 30H26V20H36V30ZM29 27H33V23H29V27ZM23 17H13V7H23V17ZM16 14H20V10H16V14ZM36 17.0625H25.9375V7H36V17.0625ZM29 14H33V10H29V14Z"
        fill="currentColor"
      />
    </svg>
  );
};
