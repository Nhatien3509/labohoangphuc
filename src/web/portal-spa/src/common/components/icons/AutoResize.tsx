import { BaseIcon } from "./BaseIcon";
import type { SVG1DProps } from "@common/components/icons/types";
import { cn } from "@common/lib/core/utils";

export const AutoResize = ({
  size = 24,
  viewBox = "0 0 24 24",
  className,
  ...props
}: SVG1DProps) => (
  <BaseIcon
    size={size}
    viewBox={viewBox}
    className={cn("text-neutral-700", className)}
    {...props}
  >
    <path
      d="M15.1701 3H21.2535M21.2535 3V9.08333M21.2535 3L9.59375 14.6597M15.6771 14.6597H9.59375M9.59375 14.6597V8.57639"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.1111 3H4.01389C3.74499 3 3.4871 3.10682 3.29696 3.29696C3.10682 3.4871 3 3.74499 3 4.01389V20.2361C3 20.505 3.10682 20.7629 3.29696 20.953C3.4871 21.1432 3.74499 21.25 4.01389 21.25H20.2361C20.505 21.25 20.7629 21.1432 20.953 20.953C21.1432 20.7629 21.25 20.505 21.25 20.2361V13.1389"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);
