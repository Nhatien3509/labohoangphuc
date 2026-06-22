import type { SVG1DProps } from "@common/components/icons/types";

export const Search = ({ size = 20, className, ...props }: SVG1DProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_36067_45891)">
        <path
          d="M18.8045 17.8619L14.2545 13.3119C15.1359 12.2233 15.6665 10.8399 15.6665 9.33328C15.6665 5.84132 12.8252 3 9.33325 3C5.84128 3 3 5.84128 3 9.33325C3 12.8252 5.84132 15.6665 9.33328 15.6665C10.8399 15.6665 12.2233 15.1359 13.3119 14.2545L17.8619 18.8045C17.9919 18.9345 18.1625 18.9998 18.3332 18.9998C18.5039 18.9998 18.6745 18.9345 18.8045 18.8045C19.0652 18.5438 19.0652 18.1225 18.8045 17.8619ZM9.33328 14.3332C6.57596 14.3332 4.33333 12.0906 4.33333 9.33325C4.33333 6.57593 6.57596 4.3333 9.33328 4.3333C12.0906 4.3333 14.3332 6.57593 14.3332 9.33325C14.3332 12.0906 12.0906 14.3332 9.33328 14.3332Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_36067_45891">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(3 3)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
