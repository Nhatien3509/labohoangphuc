import type { SVG1DProps } from "@common/components/icons/types";

export const VietnamFlagCircle = ({
  size = 20,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        height={size}
        id="mask0_36590_24327"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "luminance" }}
        width={size}
        x="0"
        y="0"
      >
        <path d="M20 0H0V20H20V0Z" fill="white" />
      </mask>
      <g mask="url(#mask0_36590_24327)">
        <path
          d="M10.0004 19.9991C15.523 19.9991 20 15.5222 20 9.99952C20 4.47695 15.523 0 10.0004 0C4.47781 0 0.000854492 4.47695 0.000854492 9.99952C0.000854492 15.5222 4.47781 19.9991 10.0004 19.9991Z"
          fill="#EE0033"
        />
        <path
          d="M9.91087 4.875L11.0987 8.53113H14.9433L11.8329 10.7904L13.0209 14.447L9.91087 12.1872L6.80063 14.447L7.98865 10.7904L4.87842 8.53113H8.72287L9.91087 4.875Z"
          fill="#FDCE0C"
        />
      </g>
    </svg>
  );
};
