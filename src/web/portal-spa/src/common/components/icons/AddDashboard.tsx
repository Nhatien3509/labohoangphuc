import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const AddDashboard = ({
  size = 24,
  className,
  ...props
}: SVG1DProps) => {
  return (
    <svg
      className={cn("text-neutral-700", className)}
      height={size}
      width={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.20854 12.324H4.40054C3.82154 12.324 3.35254 12.794 3.35254 13.372V20.202C3.35254 20.78 3.82254 21.25 4.40054 21.25H6.20954C6.78954 21.25 7.25854 20.78 7.25854 20.201V13.372C7.25827 13.0939 7.14767 12.8272 6.951 12.6305C6.75433 12.4339 6.48767 12.3233 6.20954 12.323M12.9035 2.75H11.0955C10.5155 2.75 10.0465 3.22 10.0465 3.799V20.2C10.0465 20.78 10.5165 21.249 11.0965 21.249H12.9035C13.4835 21.249 13.9525 20.779 13.9525 20.2V3.8C13.9525 3.22 13.4825 2.751 12.9025 2.751M19.5985 7.927H17.7895C17.2095 7.927 16.7405 8.397 16.7405 8.977V20.2C16.7405 20.78 17.2105 21.249 17.7895 21.249H19.5975C19.8757 21.2487 20.1423 21.1381 20.339 20.9415C20.5357 20.7448 20.6463 20.4781 20.6465 20.2V8.976C20.6465 8.396 20.1765 7.927 19.5965 7.927"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
