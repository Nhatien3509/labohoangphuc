import type { SVG1DProps } from "@common/components/icons/types";

export const Clone = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        clipRule="evenodd"
        d="M21 14.25V5.25C21 4.65326 20.7629 4.08097 20.341 3.65901C19.919 3.23705 19.3467 3 18.75 3H9.75C9.15326 3 8.58097 3.23705 8.15901 3.65901C7.73705 4.08097 7.5 4.65326 7.5 5.25V14.25C7.5 14.8467 7.73705 15.419 8.15901 15.841C8.58097 16.2629 9.15326 16.5 9.75 16.5H18.75C19.3467 16.5 19.919 16.2629 20.341 15.841C20.7629 15.419 21 14.8467 21 14.25Z"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 7.50337H5.25C4.65326 7.50337 4.08097 7.74043 3.65901 8.16238C3.23705 8.58434 3 9.15664 3 9.75338V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H5.25337L14.2534 20.9843C14.8495 20.9834 15.421 20.7459 15.8422 20.324C16.2634 19.9022 16.5 19.3304 16.5 18.7343V16.5034M14.25 6.375V13.125M17.625 9.75H10.875"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
