import { BaseIcon } from "./BaseIcon";
import type { SVG1DProps } from "@common/components/icons/types";

export const UploadFile = ({
  size = 44,
  viewBox = "0 0 44 44",
  ...props
}: SVG1DProps) => (
  <BaseIcon size={size} viewBox={viewBox} {...props}>
    <path
      d="M15 26L22 19L29 26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 19V40.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27 36H31C36.5228 36 41 31.5228 41 26C41 21.4768 37.9969 17.655 33.8758 16.4197C33.1182 11.6478 28.9851 8 24 8C19.1375 8 15.0856 11.4705 14.1862 16.0696C13.7972 16.0236 13.4014 16 13 16C7.47715 16 3 20.4772 3 26C3 31.5228 7.47715 36 13 36H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </BaseIcon>
);
