import AppLink from "@common/components/containers/AppLink";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { ChevronDown, ChevronUp } from "@common/components/icons";

import React, { type ReactNode, cloneElement, useState } from "react";
import {
  isPatternMatched,
  replacePathPlaceholders,
} from "@common/lib/helpers/str";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const SidebarNavItem = ({
  label,
  destPath,
  pattern,
  icon,
  disabled,
  isAllowedAction = true,
  children = [],
  additionalPattern,
  isHidden = false,
  sectionLabel,
}: SidebarNavItemProps) => {
  const pathName = usePathname();
  const params = useParams();
  const { t } = useLayoutStore((state) => state);
  const isItemActive =
    isPatternMatched(pattern, pathName) ||
    (!!additionalPattern && isPatternMatched(additionalPattern, pathName));
  const hasActiveChildren = children.some((child) =>
    isPatternMatched(child.pattern, pathName),
  );
  const hasChildren = !!children.length;
  const [isOpen, setIsOpen] = useState(hasActiveChildren);

  if (isHidden) return null;

  const ItemContent = (
    <>
      {sectionLabel && (
        <li className="px-4 pb-1 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-dark-400">
            {sectionLabel}
          </span>
        </li>
      )}
      <li
        className={cn(
          "relative flex items-center",
          "hover:bg-primary-50 dark:hover:bg-neutral-dark-50",
          {
            "text-primary-600 dark:text-primary-400":
              (isItemActive && !hasChildren) || hasActiveChildren,
          },
        )}
      >
        {(isItemActive && !hasChildren) || hasActiveChildren ? (
          <span className="bg-primary-600 dark:bg-primary-400 absolute left-0 top-0 h-full w-0.5 rounded-r" />
        ) : null}
        <AppLink
          className={cn(
            "z-0 flex h-full w-full items-center gap-3 py-2.5 pl-4 pr-3",
            {
              "pointer-events-none cursor-not-allowed text-neutral-400 dark:text-neutral-dark-400":
                disabled,
              "font-semibold":
                (isItemActive && !hasChildren) || hasActiveChildren,
            },
            "focus-visible focus-visible:rounded",
          )}
          href={disabled ? "#" : replacePathPlaceholders(destPath, params)}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            if (hasChildren) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {icon &&
            cloneElement(icon as React.ReactElement, {
              className: cn("shrink-0", {
                "text-primary-600 dark:text-primary-400":
                  (isItemActive && !hasChildren) || hasActiveChildren,
                "text-neutral-600 dark:text-neutral-dark-600":
                  !isItemActive && !hasActiveChildren,
              }),
            })}

          <span className="flex-1 text-sm">{label}</span>

          {hasChildren && (
            <span className="text-neutral-400 dark:text-neutral-dark-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </AppLink>
      </li>

      {isOpen &&
        children.map((child) => (
          <SecondLevelMenuItem item={child} key={child.label} />
        ))}
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

export default SidebarNavItem;

export type SidebarNavItemProps = Readonly<{
  label: string;
  destPath: string;
  pattern: string;
  disabled?: boolean;
  isAllowedAction?: boolean;
  icon?: ReactNode;
  children?: Omit<SidebarNavItemProps, "icon" | "sectionLabel">[];
  additionalPattern?: string;
  isHidden?: boolean;
  sectionLabel?: string;
}>;

const SecondLevelMenuItem = ({
  item,
}: {
  item: Omit<SidebarNavItemProps, "icon" | "sectionLabel">;
}) => {
  const pathName = usePathname();
  const params = useParams();
  const isChildActive = isPatternMatched(item.pattern, pathName);
  const hasNestedChildren = !!item.children?.length;
  const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <React.Fragment key={crypto.randomUUID()}>
      <li
        className={cn(
          "relative min-h-10",
          "hover:bg-primary-50 dark:hover:bg-neutral-dark-50",
          {
            "text-primary-600 dark:text-primary-400": isChildActive,
            "pointer-events-none": isChildActive && !hasNestedChildren,
          },
        )}
      >
        {isChildActive && (
          <span className="bg-primary-600 dark:bg-primary-400 absolute left-0 top-0 h-full w-0.5 rounded-r" />
        )}
        <AppLink
          className={cn(
            "flex h-full w-full items-center gap-3 py-2.5 pl-10 pr-4",
            item.disabled &&
              "pointer-events-none cursor-not-allowed text-neutral-400",
            {
              "font-semibold": isChildActive,
            },
            "focus-visible focus-visible:rounded",
          )}
          href={
            hasNestedChildren
              ? "#"
              : replacePathPlaceholders(item.destPath, params)
          }
          onClick={(e) => {
            if (hasNestedChildren) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className="flex-1 text-sm">{item.label}</span>
          {hasNestedChildren && (
            <span className="text-neutral-400 dark:text-neutral-dark-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </AppLink>
      </li>

      {hasNestedChildren &&
        isOpen &&
        item.children.map((nestedChild) => (
          <li
            key={crypto.randomUUID()}
            className={cn(
              "relative min-h-10",
              "hover:bg-primary-50 dark:hover:bg-neutral-dark-50",
              {
                "text-primary-600 dark:text-primary-400 pointer-events-none":
                  isPatternMatched(nestedChild.pattern, pathName),
              },
            )}
          >
            {isPatternMatched(nestedChild.pattern, pathName) && (
              <span className="bg-primary-600 dark:bg-primary-400 absolute left-0 top-0 h-full w-0.5 rounded-r" />
            )}
            <AppLink
              className={cn(
                "flex h-full w-full items-center py-2.5 pl-14 pr-4",
                nestedChild.disabled &&
                  "pointer-events-none cursor-not-allowed text-neutral-400",
                {
                  "font-semibold": isPatternMatched(
                    nestedChild.pattern,
                    pathName,
                  ),
                },
                "focus-visible focus-visible:rounded",
              )}
              href={replacePathPlaceholders(nestedChild.destPath, params)}
            >
              <span className="text-sm">{nestedChild.label}</span>
            </AppLink>
          </li>
        ))}
    </React.Fragment>
  );
};
