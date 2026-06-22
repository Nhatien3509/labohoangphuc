import { Switch, type SwitchProps } from "@common/components/ui/switch";
import { Label } from "@common/components/ui/label";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import React, { type ReactNode } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type SwitchContainerProps = SwitchProps & {
  label?: ReactNode;
  isAllowedAction?: boolean;
};

const SwitchContainer = ({
  label,
  isAllowedAction = true,
  ...props
}: SwitchContainerProps) => {
  const { t } = useLayoutStore((state) => state);

  return isAllowedAction ? (
    <div className="flex items-center gap-3">
      <Switch {...props} />
      {label && (
        <Label
          className={props.disabled ? "text-neutral-200" : "text-neutral-800"}
          htmlFor={props.id}
        >
          {label}
        </Label>
      )}
    </div>
  ) : (
    <TooltipContainer
      asChild={false}
      content={t("common.allowed_actions.no_perform")}
    >
      <div className="flex items-center gap-3">
        <Switch disabled {...props} />
        {label && (
          <Label className={"text-neutral-200"} htmlFor={props.id}>
            {label}
          </Label>
        )}
      </div>
    </TooltipContainer>
  );
};

export default SwitchContainer;
