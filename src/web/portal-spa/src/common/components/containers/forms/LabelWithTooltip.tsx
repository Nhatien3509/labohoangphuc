import TooltipContainer from "@common/components/containers/TooltipContainer";

import { QuestionMark } from "@common/components/icons";

import type { ReactNode } from "react";

type LabelWithTooltipProps = {
  label: ReactNode;
  tooltipContent: ReactNode;
  required?: boolean;
  icon?: ReactNode;
  contentClassName?: string;
  align?: "start" | "center" | "end";
};

const LabelWithTooltip = ({
  label,
  tooltipContent,
  required = false,
  icon = <QuestionMark />,
  contentClassName,
  align = "start",
}: LabelWithTooltipProps) => (
  <div className="flex items-center gap-1">
    {label}
    {required && <span className="text-primary-100"> *</span>}
    <TooltipContainer
      content={tooltipContent}
      asChild={false}
      contentClassName={contentClassName}
      align={align}
    >
      {icon}
    </TooltipContainer>
  </div>
);

export default LabelWithTooltip;
