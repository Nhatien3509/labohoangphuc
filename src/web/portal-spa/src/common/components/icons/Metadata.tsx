import type { SVG1DProps } from "@common/components/icons/types";

export const Metadata = ({ size = 24, className, ...props }: SVG1DProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="None"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="4"
        y="3"
        width="15.6"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="15.998"
        y="3"
        width="3.6"
        height="3.6"
        rx="1"
        fill="currentColor"
      />
      <path
        d="M16.3604 8.08594C16.3602 8.14077 16.3304 8.19159 16.2822 8.21777L13.708 9.61523C13.6616 9.64038 13.605 9.63931 13.5596 9.6123C13.5144 9.58521 13.4863 9.53613 13.4863 9.4834V9.00977C13.4863 8.95471 13.517 8.90415 13.5654 8.87793L15.2539 7.96484L13.5645 7.04102C13.5165 7.01466 13.4863 6.96391 13.4863 6.90918V6.43555C13.4863 6.38261 13.515 6.33366 13.5605 6.30664C13.606 6.27977 13.6626 6.27841 13.709 6.30371L16.2822 7.70801C16.3304 7.73429 16.3604 7.78495 16.3604 7.83984V8.08594Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeLinejoin="round"
      />
      <path
        d="M12.6475 5.39844C12.6934 5.39844 12.7372 5.41997 12.7656 5.45605C12.7941 5.49229 12.8049 5.54022 12.7939 5.58496L11.498 10.877C11.4813 10.9447 11.4194 10.9922 11.3496 10.9912L10.918 10.9844C10.8722 10.9837 10.8287 10.963 10.8008 10.9268C10.7728 10.8905 10.7634 10.8432 10.7744 10.7988L12.082 5.5127L12.1025 5.4668C12.1296 5.42546 12.176 5.39857 12.2275 5.39844H12.6475Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeLinejoin="round"
      />
      <path
        d="M10.083 9.4834C10.083 9.53629 10.0552 9.58526 10.0098 9.6123C9.96433 9.63926 9.90776 9.64045 9.86133 9.61523L7.28809 8.21777C7.23988 8.19159 7.20913 8.14078 7.20898 8.08594V7.83984C7.20898 7.7851 7.23915 7.73435 7.28711 7.70801L9.86133 6.30371C9.90777 6.27838 9.96426 6.27967 10.0098 6.30664C10.0553 6.33366 10.083 6.38261 10.083 6.43555V6.90918C10.083 6.96402 10.053 7.01471 10.0049 7.04102L8.31445 7.96484L10.0049 8.87793C10.0532 8.90417 10.083 8.95478 10.083 9.00977V9.4834Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.59961 13.8008H15.9996"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.59961 17.4009H15.9996"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
