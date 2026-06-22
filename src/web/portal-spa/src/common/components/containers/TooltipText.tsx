import TooltipContainer, {
  type TooltipProps,
} from "@common/components/containers/TooltipContainer";

import { cn } from "@common/lib/core/utils";
import { truncateText } from "@common/lib/helpers/str";
import useResponsiveWidth from "@common/hooks/useResponsiveWidth";

export default function TooltipText({
  content,
  maxWidth = 20,
  maxLength,
  className,
  isPreventDefault = true,
  tooltipContent = content,
  alwaysDisplayTooltip = false,
  tooltipProps = {},
}: Readonly<{
  content: string;
  maxWidth?: number;
  maxLength?: number;
  className?: string;
  isPreventDefault?: boolean;
  tooltipContent?: string;
  alwaysDisplayTooltip?: boolean;
  tooltipProps?: TooltipProps;
}>) {
  const { elementRef: textContainerRef, isOverflowed } = useResponsiveWidth({
    maxWidth,
  });
  const showTooltip =
    alwaysDisplayTooltip ||
    (typeof maxLength === "number" ? content.length > maxLength : isOverflowed);

  const DisplayContent = (
    <div
      className={cn({
        "overflow-hidden text-ellipsis whitespace-pre": !maxLength,
      })}
    >
      {maxLength ? truncateText(content, maxLength) : content}
    </div>
  );

  return (
    <div
      className={cn(className)}
      ref={textContainerRef}
      style={!maxLength ? { maxWidth: `${maxWidth}rem` } : undefined}
    >
      {showTooltip ? (
        <TooltipContainer
          {...{ isPreventDefault, content: tooltipContent }}
          className="max-w-80"
          {...tooltipProps}
        >
          {DisplayContent}
        </TooltipContainer>
      ) : (
        DisplayContent
      )}
    </div>
  );
}
