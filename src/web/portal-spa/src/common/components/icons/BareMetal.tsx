import type { SVG1DProps } from "@common/components/icons/types";

export const BareMetal = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M3 7.5V5.25C3 4.65326 3.23705 4.08097 3.65901 3.65901C4.08097 3.23705 4.65326 3 5.25 3H7.5M3 16.5V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H7.5M16.5 3H18.75C19.3467 3 19.919 3.23705 20.341 3.65901C20.7629 4.08097 21 4.65326 21 5.25V7.5M16.5 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V16.5M6.375 12V8.625H9.75M14.25 8.625H17.625V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.375 8.625L11.3407 13.5907C11.7627 14.0126 11.9999 14.5848 12 15.1815M12 15.1815V17.625M12 15.1815C12.0001 14.5848 12.2373 14.0126 12.6593 13.5907L17.625 8.625"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
