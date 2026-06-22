import type { SVG1DProps } from "@common/components/icons/types";

export const ChevronRightV2 = ({
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
        d="M7.75821 2.37397L15.7255 10.3556C15.7972 10.4241 15.8541 10.5066 15.8927 10.598C15.9313 10.6894 15.9508 10.7877 15.9499 10.8869C15.9502 11.0916 15.8695 11.2881 15.7255 11.4336C12.8435 14.2452 10.066 16.9589 7.39301 19.5747C7.25551 19.7034 6.70551 20.0235 6.28091 19.5483C5.85631 19.072 6.11371 18.6573 6.28091 18.4857L14.0557 10.8869L6.63401 3.45197C6.36341 3.07907 6.38541 2.73477 6.70001 2.41907C7.01461 2.10337 7.36771 2.08797 7.75821 2.37397Z"
        fill="currentColor"
      />
    </svg>
  );
};
