import TooltipContainer, {
  type TooltipProps,
} from "@common/components/containers/TooltipContainer";
import { Button } from "@common/components/ui/button";

import React, { type ReactNode, forwardRef } from "react";
import AppLink from "@common/components/containers/AppLink";
import type { LinkProps } from "next/link";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type AllowedActionButtonProps = React.ComponentProps<typeof Button> & {
  isAllowedAction: boolean;
  redirectPath?: string;
  disabledContent?: string;
  tooltipDefaultContent?: ReactNode;
  tooltipProps?: TooltipProps;
  linkProps?: LinkProps;
};

type TooltipState = {
  content?: ReactNode;
  disabled: boolean;
};

const AllowedActionButton = forwardRef<
  HTMLButtonElement,
  AllowedActionButtonProps
>(
  (
    {
      children,
      isAllowedAction,
      content,
      redirectPath,
      disabled,
      disabledContent,
      className,
      tooltipDefaultContent,
      tooltipProps,
      linkProps,
      ...props
    },
    ref,
  ) => {
    const { t, isNavigating } = useLayoutStore((state) => ({
      t: state.t,
      isNavigating: state.isNavigating,
    }));

    const resolveTooltipState = (): TooltipState => {
      if (!isAllowedAction || disabled) {
        return {
          disabled: true,
          content: !isAllowedAction
            ? (content ?? t("common.allowed_actions.no_perform"))
            : disabledContent,
        };
      }

      return {
        disabled: isNavigating,
        content: tooltipDefaultContent,
      };
    };

    const { disabled: resolvedDisabled, content: tooltipContent } =
      resolveTooltipState();

    const btn = (
      <Button
        ref={ref}
        {...props}
        disabled={resolvedDisabled}
        className={cn(className, {
          "disabled:!pointer-events-auto": resolvedDisabled,
        })}
      >
        {children}
      </Button>
    );

    const wrappedBtn = tooltipContent ? (
      <TooltipContainer {...tooltipProps} content={tooltipContent}>
        {btn}
      </TooltipContainer>
    ) : (
      btn
    );

    if (redirectPath && !resolvedDisabled) {
      return (
        <AppLink {...linkProps} href={redirectPath} className="inline-block">
          {wrappedBtn}
        </AppLink>
      );
    }
    return wrappedBtn;
  },
);

export default AllowedActionButton;
