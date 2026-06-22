import type { SVG1DProps } from "@common/components/icons/types";

export const KeyPair = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M12 10C12 10.5304 12.2107 11.0391 12.5858 11.4142C12.9609 11.7893 13.4696 12 14 12C14.5304 12 15.0391 11.7893 15.4142 11.4142C15.7893 11.0391 16 10.5304 16 10C16 9.46957 15.7893 8.96086 15.4142 8.58579C15.0391 8.21071 14.5304 8 14 8C13.4696 8 12.9609 8.21071 12.5858 8.58579C12.2107 8.96086 12 9.46957 12 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 11.5L8.5 15.5L10 17M12 15L10.5 13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3.05546 3.05546C2.53973 3.57118 2.25 4.27065 2.25 5V19C2.25 19.7293 2.53973 20.4288 3.05546 20.9445C3.57118 21.4603 4.27065 21.75 5 21.75H19C19.7293 21.75 20.4288 21.4603 20.9445 20.9445C21.4603 20.4288 21.75 19.7293 21.75 19V5C21.75 4.27065 21.4603 3.57118 20.9445 3.05546C20.4288 2.53973 19.7293 2.25 19 2.25H5C4.27065 2.25 3.57118 2.53973 3.05546 3.05546Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
