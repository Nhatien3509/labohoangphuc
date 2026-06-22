import type { SVG1DProps } from "@common/components/icons/types";

export const VietnamFlag = ({
  width = 20,
  height = 15,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 20 15"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="Clip path group">
        <mask
          height="15"
          id="mask0_44955_107732"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "luminance" }}
          width="20"
          x="0"
          y="0"
        >
          <g id="a">
            <path d="M0 0H20V14.9999H0V0Z" fill="white" id="Vector" />
          </g>
        </mask>
        <g mask="url(#mask0_44955_107732)">
          <g id="Group">
            <path
              clipRule="evenodd"
              d="M-1.25 0H21.2499V14.9999H-1.25V0Z"
              fill="#EC0015"
              fillRule="evenodd"
              id="Vector_2"
            />
            <path
              clipRule="evenodd"
              d="M12.7419 11.1664L10.1176 9.20668L7.50622 11.1857L8.47747 7.96977L5.87085 5.98392L9.09583 5.95623L10.0961 2.75L11.1177 5.94891L14.3427 5.95313L11.7495 7.9577L12.7422 11.1666L12.7419 11.1664Z"
              fill="#FFFF00"
              fillRule="evenodd"
              id="Vector_3"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
