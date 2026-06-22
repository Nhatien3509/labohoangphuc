// For mobile resolutions

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@common/components/ui/collapsible";
import AppLink from "@common/components/containers/AppLink";
import { DropdownMenuItem } from "@common/components/ui/dropdown-menu";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { CaretDown } from "@common/components/icons";

import React, { cloneElement, useState } from "react";
import {
  isPatternMatched,
  replacePathPlaceholders,
} from "@common/lib/helpers/str";
import { useParams, usePathname } from "next/navigation";
import { type SidebarNavItemProps } from "@common/components/layout/sidebar/SidebarNavItem";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const SidebarDropdownItem = ({
  label,
  destPath,
  pattern,
  icon,
  disabled,
  isAllowedAction = true,
  children = [],
  additionalPattern,
  isHidden = false,
}: SidebarNavItemProps) => {
  const pathName = usePathname();
  const params = useParams();
  const { t } = useLayoutStore((state) => state);
  const isItemActive =
    isPatternMatched(pattern, pathName) ||
    (additionalPattern && isPatternMatched(additionalPattern, pathName));
  const hasActiveChildren = children.some((child) =>
    isPatternMatched(child.pattern, pathName),
  );
  const hasChildren = children.length > 0;
  const [isItemExpandable, setIsItemExpandable] = useState(!!isItemActive);

  if (isHidden) return null;

  const ItemContent = (
    <>
      {hasChildren ? (
        <Collapsible open={isItemExpandable} onOpenChange={setIsItemExpandable}>
          <CollapsibleTrigger asChild>
            <p
              className={cn(
                "flex cursor-pointer items-center justify-between space-x-3 py-3 pl-6 pr-3 text-base",
                {
                  "font-bold": hasActiveChildren,
                  "pointer-events-none cursor-not-allowed text-neutral-400":
                    disabled,
                },
              )}
            >
              {icon &&
                cloneElement(icon as React.ReactElement, {
                  className: "text-neutral-700 dark:text-neutral-dark-900",
                })}

              <span>{label}</span>

              {children.length > 0 && (
                <CaretDown
                  className={`!ml-auto ${isItemExpandable ? "rotate-180" : ""} `}
                />
              )}
            </p>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {children.map((child) => (
              <AppLink
                key={child.pattern}
                className={cn(
                  "focus-visible flex h-full w-full cursor-pointer items-center space-x-4 focus-visible:rounded",
                  {
                    "bg-primary-50 font-bold dark:bg-neutral-600":
                      isPatternMatched(child.pattern, pathName),
                    "pointer-events-none cursor-not-allowed text-neutral-400":
                      child.disabled,
                  },
                )}
                href={replacePathPlaceholders(child.destPath, params)}
              >
                <DropdownMenuItem className="!ml-0 h-full w-full cursor-pointer items-center space-x-3 p-0 py-3 pl-16 pr-3 text-base lg:hidden">
                  {child.label}
                </DropdownMenuItem>
              </AppLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <AppLink
          className={cn(
            "z-0 flex h-full w-full items-center space-x-3 py-3 pl-6 pr-3",
            {
              "pointer-events-none cursor-not-allowed text-neutral-400":
                disabled,
              "pointer-events-none bg-primary-50 font-bold dark:bg-neutral-600":
                isItemActive,
            },
            "focus-visible focus-visible:rounded max-lg:inline max-lg:p-0",
          )}
          href={disabled ? "#" : replacePathPlaceholders(destPath, params)}
          onClick={(e) => {
            if (disabled) e.preventDefault();
          }}
        >
          <DropdownMenuItem className="!ml-0 h-full w-full cursor-pointer items-center space-x-3 p-0 py-3 pl-6 pr-3 lg:hidden">
            {icon &&
              cloneElement(icon as React.ReactElement, {
                className: "text-neutral-700 dark:text-neutral-dark-900",
              })}

            <span>{label}</span>
          </DropdownMenuItem>
        </AppLink>
      )}
    </>
  );

  return !isAllowedAction ? (
    <TooltipContainer
      asChild={false}
      content={t("common.allowed_actions.no_access")}
    >
      {ItemContent}
    </TooltipContainer>
  ) : (
    ItemContent
  );
};

export default SidebarDropdownItem;
