import { BaseIcon } from "./BaseIcon";
import type { SVG1DProps } from "@common/components/icons/types";

export const Retry = ({
  size = 21,
  viewBox = "0 0 21 20",
  className = "text-primary-100",
  ...props
}: SVG1DProps) => (
  <BaseIcon size={size} viewBox={viewBox} className={className} {...props}>
    <path
      d="M12.9994 3.79171C12.1841 3.4634 11.3122 3.29889 10.4333 3.30758C9.55443 3.31626 8.68588 3.49797 7.87724 3.84232C7.0686 4.18667 6.3357 4.68692 5.72038 5.31451C5.10507 5.94211 4.6194 6.68475 4.29109 7.50004C3.62805 9.14659 3.64626 10.9891 4.34171 12.6222C5.03715 14.2554 6.35288 15.5453 7.99943 16.2084M7.99943 12.5V16.6667H3.83276"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8086 5.96667V5.97501"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.334 16.6167V16.625"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5332 15.3083V15.3167"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.6426 12.5834V12.5917"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.1172 9.16663V9.17496"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);
