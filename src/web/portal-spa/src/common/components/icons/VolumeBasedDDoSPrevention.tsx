import type { SVG1DProps } from "@common/components/icons/types";

export const VolumeBasedDDoSPrevention = ({
  size = 48,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 48 48"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 20.834C6 14.438 6 11.24 6.756 10.164C7.51 9.09 10.516 8.06 16.53 6.002L17.676 5.61C20.81 4.536 22.376 4 24 4C25.624 4 27.19 4.536 30.324 5.61L31.47 6.002C37.484 8.06 40.49 9.09 41.244 10.164C42 11.24 42 14.44 42 20.834V23.982C42 35.258 33.522 40.732 28.202 43.054C26.76 43.684 26.04 44 24 44C21.96 44 21.24 43.684 19.798 43.054C14.478 40.73 6 35.26 6 23.982V20.834Z"
        stroke="currentColor"
        strokeWidth={3}
      />
      <path
        d="M32 23.0996L25.2 17.9996C24.8538 17.74 24.4327 17.5996 24 17.5996C23.5673 17.5996 23.1462 17.74 22.8 17.9996L16 23.0996M28 28.0996L24 25.0996L20 28.0996"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
