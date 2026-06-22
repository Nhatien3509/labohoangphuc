import React from "react";

import {
  Arrow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@common/components/ui/tooltip";

import { type TooltipContentProps } from "@radix-ui/react-tooltip";
import { cn } from "@common/lib/core/utils";

export type TooltipProps = Omit<React.ComponentProps<"div">, "content"> &
  Omit<TooltipContentProps, "content"> & {
    content?: React.ReactNode;
    isPreventDefault?: boolean;
    arrowClassName?: string;
    contentClassName?: string;
    arrowHeight?: number;
    arrowWidth?: number;
    disableHoverableContent?: boolean;
    triggerClassName?: string;
  };

const TooltipContainer = ({
  content,
  children,
  isPreventDefault = true,
  arrowClassName,
  contentClassName,
  arrowHeight = 5,
  arrowWidth = 11,
  asChild = true,
  disableHoverableContent = false,
  triggerClassName,
  ...props
}: TooltipProps) => {
  return (
    <TooltipProvider
      delayDuration={9}
      disableHoverableContent={disableHoverableContent}
    >
      <Tooltip>
        <TooltipTrigger
          asChild={asChild}
          className={triggerClassName}
          onClick={(e) => {
            if (isPreventDefault) {
              e.preventDefault();
            }
          }}
        >
          {children}
        </TooltipTrigger>
        {content && (
          <TooltipContent
            {...props}
            arrowPadding={
              props.align === "end" || props.align === "start"
                ? 8
                : props.arrowPadding
            }
          >
            <div>
              <div
                className={cn(
                  "text-neultra-50 whitespace-pre-wrap break-words text-base",
                  contentClassName,
                )}
              >
                {content}
              </div>
              <Arrow
                className={arrowClassName}
                height={arrowHeight}
                width={arrowWidth}
              />
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipContainer;
