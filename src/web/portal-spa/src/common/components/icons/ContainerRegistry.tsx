import type { SVG1DProps } from "@common/components/icons/types";

export const ContainerRegistry = ({
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
        d="M25 19V8H11V33H37V19H25ZM14 11H22V19H14V11ZM14 22H22V30H14V22ZM34 30H25V22H34V30Z"
        fill="currentColor"
      />
      <path
        d="M41 16H28V3H41V16ZM31 13H38V6H31V13ZM42 30H39V33H42V42H6V33H9V30H6C5.20435 30 4.44129 30.3161 3.87868 30.8787C3.31607 31.4413 3 32.2043 3 33V42C3 42.7957 3.31607 43.5587 3.87868 44.1213C4.44129 44.6839 5.20435 45 6 45H42C42.7957 45 43.5587 44.6839 44.1213 44.1213C44.6839 43.5587 45 42.7957 45 42V33C45 32.2043 44.6839 31.4413 44.1213 30.8787C43.5587 30.3161 42.7957 30 42 30Z"
        fill="currentColor"
      />
      <path
        d="M10.5 39C11.3284 39 12 38.3284 12 37.5C12 36.6716 11.3284 36 10.5 36C9.67157 36 9 36.6716 9 37.5C9 38.3284 9.67157 39 10.5 39Z"
        fill="currentColor"
      />
    </svg>
  );
};
