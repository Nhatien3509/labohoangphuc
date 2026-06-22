import type { SVG1DProps } from "@common/components/icons/types";

export const LandingPage = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      fill="none"
      height={size}
      className={className}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.14288 8.18848H15.4286M6.26403 11.6605L7.40688 11.6399C7.68684 11.6345 7.95904 11.7321 8.17181 11.9141C8.38459 12.0961 8.52314 12.3499 8.56117 12.6273L8.57145 12.7816V13.9062C8.57151 14.2056 8.45409 14.493 8.24443 14.7067C8.03478 14.9204 7.74964 15.0434 7.45031 15.049L6.30745 15.0696C6.0275 15.075 5.7553 14.9774 5.54253 14.7954C5.32975 14.6134 5.1912 14.3596 5.15317 14.0822L5.14288 13.9268V12.8033C5.14283 12.504 5.26025 12.2165 5.46991 12.0028C5.67956 11.7891 5.9647 11.6662 6.26403 11.6605Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8572 11.617H15.4286M10.8572 15.0455H15.4286M4.00001 4.74268H16.5714C17.1776 4.74268 17.759 4.98349 18.1877 5.41215C18.6163 5.8408 18.8572 6.42218 18.8572 7.02839V18.4741H4.00001C3.3938 18.4741 2.81242 18.2333 2.38376 17.8046C1.95511 17.376 1.71429 16.7946 1.71429 16.1884V7.02953C1.71429 6.42332 1.95511 5.84194 2.38376 5.41329C2.81242 4.98463 3.3938 4.74268 4.00001 4.74268Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2857 18.4742C19.0435 18.4742 19.7702 18.1732 20.306 17.6374C20.8418 17.1015 21.1428 16.3748 21.1428 15.617V8.18848H18.8571"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
