import type { SVG1DProps } from "@common/components/icons/types";

export const SignOut = ({ size = 24, className, ...props }: SVG1DProps) => {
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
        d="M9.743 7.42006C8.71709 7.92909 7.89337 8.76997 7.4056 9.80615C6.91782 10.8423 6.79464 12.013 7.05606 13.128C7.31747 14.243 7.94813 15.2369 8.84563 15.9484C9.74312 16.6598 10.8547 17.0469 12 17.0469C13.1453 17.0469 14.2569 16.6598 15.1544 15.9484C16.0519 15.2369 16.6825 14.243 16.9439 13.128C17.2054 12.013 17.0822 10.8423 16.5944 9.80615C16.1066 8.76997 15.2829 7.92909 14.257 7.42006M12 6.36206V10.8761"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 21.5C14.5196 21.5 16.9359 20.4991 18.7175 18.7175C20.4991 16.9359 21.5 14.5196 21.5 12C21.5 9.48044 20.4991 7.06408 18.7175 5.28249C16.9359 3.50089 14.5196 2.5 12 2.5C9.48044 2.5 7.06408 3.50089 5.28249 5.28249C3.50089 7.06408 2.5 9.48044 2.5 12C2.5 14.5196 3.50089 16.9359 5.28249 18.7175C7.06408 20.4991 9.48044 21.5 12 21.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
