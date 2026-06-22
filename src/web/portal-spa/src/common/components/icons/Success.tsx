import type { SVG2DProps } from "@common/components/icons/types";

export const Success = ({
  width = 65,
  height = 64,
  className,
  fill = "#008A0E",
  ...props
}: SVG2DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox={`0 0 65 64`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_36586_87244)">
        <path
          clipRule="evenodd"
          d="M32.5 0C14.85 0 0.5 14.35 0.5 32C0.5 49.65 14.85 64 32.5 64C50.15 64 64.5 49.65 64.5 32C64.5 14.35 50.15 0 32.5 0Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          clipRule="evenodd"
          d="M47.9751 21.2125C48.7501 21.9875 48.7501 23.2625 47.9751 24.0375L29.2251 42.7875C28.8376 43.175 28.3251 43.375 27.8126 43.375C27.3001 43.375 26.7876 43.175 26.4001 42.7875L17.0251 33.4125C16.2501 32.6375 16.2501 31.3625 17.0251 30.5875C17.8001 29.8125 19.0751 29.8125 19.8501 30.5875L27.8126 38.55L45.1501 21.2125C45.9251 20.425 47.2001 20.425 47.9751 21.2125Z"
          fill="white"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_36586_87244">
          <rect
            fill="white"
            height="64"
            transform="translate(0.5)"
            width="64"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
