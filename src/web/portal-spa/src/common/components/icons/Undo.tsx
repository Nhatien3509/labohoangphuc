import type { SVG1DProps } from "@common/components/icons/types";

export const Undo = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M9.41181 8.41181H5V4M5.25677 15.7857C6.079 17.0518 7.28548 18.021 8.69908 18.5509C10.1127 19.0808 11.6589 19.1435 13.1108 18.7299C14.5627 18.3163 15.8438 17.4481 16.7659 16.2528C17.688 15.0575 18.2026 13.598 18.2342 12.0887C18.2657 10.5793 17.8126 9.09965 16.9412 7.86684C16.0699 6.63403 14.8262 5.71304 13.3929 5.23909C11.9596 4.76515 10.4121 4.76321 8.97754 5.23356C7.54303 5.70391 6.29709 6.62177 5.42265 7.85239"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
