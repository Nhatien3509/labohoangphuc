"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@common/components/ui/navigation-menu";
import AppLink from "@common/components/containers/AppLink";

import type { LinkProps } from "next/link";
import NavMenuContent from "@common/components/layout/navigation-menu/NavMenuContent";

import React, { useMemo, useRef, useState } from "react";
import { ROUTES } from "@common/lib/core/routes";
import { cn } from "@common/lib/core/utils";
import { useFeatureFlags } from "@common/hooks/useFeatureFlags";

export type MenuItem = {
  sub_menu?: MenuItem[];
  href?: string;
  id: string;
  name?: string;
  title: string;
  description?: string;
  icon_code?: number | null;
  isPinned?: boolean;
  favourite_id?: string;
  isDynamicSubMenu?: boolean;
};

export const NavMenuList = React.memo(
  ({
    toggleMenu,
    t,
  }: {
    toggleMenu: () => void;
    t: (str: string) => string;
  }) => {
    const [offsetTop, setOffsetTop] = useState(0);
    const child = useRef<HTMLDivElement>(null);
    const [isFileStorageEnabled] = useFeatureFlags(["fileStorage.enabled"]);
    const menuList: MenuItem[] = useMemo(() => {
      const baseMenu = [
        {
          id: "dashboard",
          title: t("nav_menu.dashboard"),
          href: ROUTES.dashboard.home,
        },
        ...(isFileStorageEnabled
          ? [
              {
                id: "file_storage",
                title: t("nav_menu.file_storage"),
                href: ROUTES.fileStorage.filesystem,
                sub_menu: [
                  {
                    id: "filesystem",
                    title: t("sidebar.file_storage.filesystem"),
                    href: ROUTES.fileStorage.filesystem,
                  },
                  {
                    id: "snapshot",
                    title: t("sidebar.file_storage.snapshot"),
                    href: ROUTES.fileStorage.snapshots,
                  },
                  {
                    id: "policy",
                    title: t("sidebar.file_storage.policy"),
                    href: ROUTES.fileStorage.policies,
                  },
                ],
              },
            ]
          : []),
        {
          id: "all_service",
          title: t("nav_menu.all_service"),
          isDynamicSubMenu: true,
        },
        {
          title: t("nav_menu.pinned_services"),
          id: "pinned_services",
          isDynamicSubMenu: true,
        },
      ];

      return baseMenu;
    }, [isFileStorageEnabled]);

    return (
      <NavigationMenu
        className="w-[18rem]"
        orientation="vertical"
        customViewport
      >
        <NavigationMenuList className="w-[18rem] flex-col items-start space-x-0">
          {menuList.map(({ title, sub_menu, id, isDynamicSubMenu, href }) =>
            sub_menu || isDynamicSubMenu ? (
              <NavigationMenuItem
                key={crypto.randomUUID()}
                onMouseEnter={(e) => {
                  setOffsetTop(e.currentTarget.offsetTop - 12);
                }}
                className="!ml-0 w-full"
              >
                <NavigationMenuTrigger
                  className={cn(
                    "h-auto w-full justify-between py-3 pl-6 pr-[1.375rem] text-md font-normal",
                    "hover:bg-primary-50 hover:font-semibold",
                    "data-[state=open]:bg-primary-50 data-[state=open]:font-semibold",
                  )}
                >
                  {title}
                </NavigationMenuTrigger>
                <NavMenuContent
                  {...{ toggleMenu, sub_menu, title, id }}
                  isDynamicSubMenu={isDynamicSubMenu ?? false}
                  child={child.current}
                />
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem
                key={title + "menu-item"}
                onClick={toggleMenu}
                onMouseEnter={(e) => {
                  setOffsetTop(e.currentTarget.offsetTop);
                }}
                className={cn(
                  "text-md font-normal",
                  "w-full py-3 pl-6 pr-[1.375rem]",
                  "hover:bg-primary-50 hover:font-semibold",
                )}
              >
                <AppLink href={href ?? "/"}>{title}</AppLink>
              </NavigationMenuItem>
            ),
          )}

          <div
            className={cn(
              "base-transition",
              "absolute left-[17.75rem] flex justify-center",
            )}
            style={{
              top: offsetTop,
            }}
            ref={child}
          >
            <NavigationMenuViewport />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    );
  },
);

NavMenuList.displayName = "NavMenuList";

export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & LinkProps
>(({ className, children, ...props }, ref) => {
  return (
    <li className="w-full">
      <NavigationMenuLink asChild>
        <AppLink ref={ref} className={cn("block", className)} {...props}>
          {children}
        </AppLink>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
