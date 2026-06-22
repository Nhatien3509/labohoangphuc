"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type ItemOptions = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  isAllowedAction?: boolean;
  getItemDetails?: boolean;
  disabledReason?: string;
};

interface DropdownButtonProps {
  children: ReactNode;
  options: ItemOptions[];
  onChange: (item: ItemOptions) => void;
  className?: string;
  align?: "start" | "center" | "end";
  extraItems?: ReactNode;
  tooltipAlign?: "start" | "center" | "end";
}

export default function DropdownButton({
  children,
  options,
  onChange,
  className,
  tooltipAlign,
  align = "end",
  extraItems = null,
}: Readonly<DropdownButtonProps>) {
  const { t } = useLayoutStore((state) => state);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger ref={triggerRef} asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        style={{ minWidth: triggerWidth }}
        className={cn(
          "scrollbar my-1 flex max-h-[45vh] flex-col overflow-auto border-none px-0 py-3 !shadow-D-X0-Y0-B10-S0-30",
          className,
        )}
      >
        {options.map((item) => {
          return !(item.isAllowedAction ?? true) ? (
            <TooltipContainer
              asChild={false}
              content={t("common.allowed_actions.no_perform")}
              key={item.value}
              align={tooltipAlign}
            >
              <DropdownMenuItem
                disabled
                className="group p-0"
                onClick={() => {
                  onChange(item);
                }}
              >
                <span
                  className={
                    "gap-3 py-3 pl-6 pr-3 text-neutral-800 hover:font-semibold hover:text-neutral-800 focus:text-neutral-800 group-focus:font-semibold dark:text-neutral-0"
                  }
                >
                  {item.icon}
                </span>
                <span className="pr-6">{item.label}</span>
              </DropdownMenuItem>
            </TooltipContainer>
          ) : (
            <TooltipContainer
              asChild={false}
              content={item.disabled ? item.disabledReason : ""}
              key={item.value}
              className="max-w-72"
              triggerClassName={cn({
                "cursor-default": item.disabled,
              })}
              align={tooltipAlign}
            >
              <DropdownMenuItem
                key={item.value}
                className="group cursor-pointer p-0"
                disabled={item.disabled}
                onClick={() => {
                  onChange(item);
                }}
              >
                <div
                  className={
                    "flex h-auto w-full items-center justify-start gap-3 rounded-none px-6 py-3 text-neutral-800 hover:bg-primary-50 hover:font-medium hover:text-neutral-800 focus:text-neutral-800 active:font-semibold active:text-neutral-800 group-focus:font-medium dark:text-neutral-0"
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </DropdownMenuItem>
            </TooltipContainer>
          );
        })}
        {extraItems && <>{extraItems}</>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
