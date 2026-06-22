"use client";

import TooltipContainer, {
  type TooltipProps,
} from "@common/components/containers/TooltipContainer";

import { type ReactNode } from "react";

type IconWithTooltipProps = {
  tooltipProps?: TooltipProps;
  children: ReactNode;
};

const IconWithTooltip = ({
  tooltipProps = {},
  children,
}: IconWithTooltipProps) => {
  const { sideOffset = 6, ...rest } = tooltipProps;
  return (
    <TooltipContainer {...rest} asChild sideOffset={sideOffset}>
      <div>{children}</div>
    </TooltipContainer>
  );
};

export default IconWithTooltip;
