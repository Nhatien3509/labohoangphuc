"use client";

import { NavigationMenuContent } from "@common/components/ui/navigation-menu";

import { type MenuItem } from "@common/components/layout/navigation-menu/NavMenuList";
import { MouseSafeArea } from "@common/components/layout/navigation-menu/MouseSafeArea";
import NavMenuExpandedItem from "@common/components/layout/navigation-menu/NavMenuExpandedItem";
import NavMenuItem from "@common/components/layout/navigation-menu/NavMenuItem";

import React, { useMemo, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type NavMenuContentProps = {
  toggleMenu: () => void;
  sub_menu?: MenuItem[];
  title: string;
  isDynamicSubMenu: boolean;
  id: string;
  child: HTMLDivElement | null;
};

const NavMenuContent = ({
  sub_menu,
  toggleMenu,
  title,
  isDynamicSubMenu,
  id,
  child,
}: NavMenuContentProps) => {
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const { services, favoriteServices, categories, t } = useLayoutStore(
    (state) => state,
  );

  const cate_menu = useMemo(() => {
    const favouriteMap = new Map(
      favoriteServices.map((fav) => [fav.service, fav.id]),
    );
    if (id === "all_service")
      return categories.map((category) => ({
        ...category,
        sub_menu: services
          .filter(
            (service) => service.category === category.id && service.title,
          )
          .map((service) => ({
            id: service.id,
            name: service.name,
            title: service.title,
            icon_code: service.iconCode,
            isPinned: favouriteMap.has(service.id),
            favourite_id: favouriteMap.get(service.id),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));

    if (id === "pinned_services") {
      return services
        .filter((service) =>
          favoriteServices.some((fav) => fav.service === service.id),
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          title: service.title ?? "",
          icon_code: service.iconCode,
          isPinned: favouriteMap.has(service.id),
          favourite_id: favouriteMap.get(service.id),
        }));
    }

    return sub_menu;
  }, [isDynamicSubMenu, sub_menu, categories, services, favoriteServices]);

  return (
    <NavigationMenuContent
      className={cn("w-auto border-none shadow-none base-transition")}
    >
      {child && <MouseSafeArea submenu={child} />}
      <ul className={cn("grid w-[22.1875rem] grid-cols-1 py-3")}>
        <div className="flex-col px-5 pb-2">
          <div className="select-none text-lg font-semibold uppercase leading-8">
            {title}
          </div>
          <div className="mt-[0.6875rem] w-full border-b bg-neutral-100" />
        </div>
        <div className="scrollbar max-h-[34.625rem] overflow-y-auto">
          {Array.isArray(cate_menu) && cate_menu.length > 0 ? (
            (cate_menu as MenuItem[]).map((item) => (
              <div key={crypto.randomUUID()}>
                <NavMenuItem
                  cate_item={item}
                  {...{
                    isExpanded,
                    toggleMenu,
                    setIsExpanded,
                  }}
                />

                {item.sub_menu?.map(
                  (service) =>
                    isExpanded[item.id] && (
                      <NavMenuExpandedItem
                        service={service}
                        key={crypto.randomUUID()}
                        toggleMenu={toggleMenu}
                      />
                    ),
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-2 text-base italic text-neutral-500 dark:text-neutral-400">
              {t("nav_menu.no_data")}
            </div>
          )}
        </div>
      </ul>
    </NavigationMenuContent>
  );
};

export default NavMenuContent;
