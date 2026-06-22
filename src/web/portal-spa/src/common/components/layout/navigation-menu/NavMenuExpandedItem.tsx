import {
  ListItem,
  type MenuItem,
} from "@common/components/layout/navigation-menu/NavMenuList";

import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type NavMenuExpandedItemProps = {
  service: MenuItem;
  toggleMenu: () => void;
};

const NavMenuExpandedItem = ({
  service,
  toggleMenu,
}: NavMenuExpandedItemProps) => {
  const { currentProject, updateLayoutDialogState, launchingServices } =
    useLayoutStore((state) => state);

  const launchingService = launchingServices.find(
    (ls) => ls.name === service.name,
  );

  return (
    <div
      key={crypto.randomUUID()}
      className={cn(
        "m-auto flex h-12 select-none items-center pl-[2.75rem] pr-5",
        "no-underline outline-none transition-colors",
        "hover:bg-primary-50 hover:font-semibold",
        "focus:bg-accent focus:text-accent-foreground",
        "justify-between",
        "group",
      )}
    >
      {launchingService?.homeHref && currentProject?.id ? (
        <ListItem
          className={`w-full`}
          onClick={toggleMenu}
          href={launchingService.homeHref}
        >
          {service.title}
        </ListItem>
      ) : (
        <button
          onClick={() => {
            if (launchingService) {
              updateLayoutDialogState({
                project_required: { isOpen: true },
              });
              toggleMenu();
              return;
            }

            updateLayoutDialogState({
              coming_soon: { isOpen: true, serviceName: service.name },
            });
            toggleMenu();
          }}
          className={`w-full text-left`}
        >
          {service.title}
        </button>
      )}
    </div>
  );
};

export default NavMenuExpandedItem;
