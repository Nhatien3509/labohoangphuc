import { BoxMinus, BoxPlus } from "@common/components/icons";
import {
  ListItem,
  type MenuItem,
} from "@common/components/layout/navigation-menu/NavMenuList";

import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const NavMenuItem = ({
  cate_item: { sub_menu, id, title, name, href },
  toggleMenu,
  setIsExpanded,
  isExpanded,
}: {
  cate_item: MenuItem;
  toggleMenu: () => void;
  isExpanded: Record<string, boolean>;
  setIsExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) => {
  const { currentProject, updateLayoutDialogState, launchingServices } =
    useLayoutStore((state) => ({
      currentProject: state.currentProject,
      updateLayoutDialogState: state.updateLayoutDialogState,
      launchingServices: state.launchingServices,
    }));

  const launchingService = launchingServices.find((ls) => ls.name === name);

  return (
    <div
      className={cn(
        "m-auto flex h-12 select-none items-center px-5",
        "no-underline outline-none transition-colors",
        "hover:bg-primary-50 hover:font-semibold",
        "focus:bg-accent focus:text-accent-foreground",
        "group",
      )}
    >
      {sub_menu ? (
        <div key={id} className="flex items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded((prev) => ({
                ...prev,
                [id]: !prev[id],
              }));
            }}
            className="p-2 pl-0 text-neutral-0 hover:text-neutral-100 active:text-neutral-50"
          >
            {isExpanded[id] ? <BoxMinus /> : <BoxPlus />}
          </button>
          <button
            className="uppercase"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded((prev) => ({
                ...prev,
                [id]: !prev[id],
              }));
            }}
          >
            {title}
          </button>
        </div>
      ) : (
        <>
          {launchingService?.homeHref || href ? (
            <ListItem
              className={`w-full`}
              onClick={(e) => {
                toggleMenu();
                if (currentProject?.id) {
                  return;
                }
                e.preventDefault();
                updateLayoutDialogState({
                  project_required: { isOpen: true },
                });
              }}
              href={href ?? launchingService?.homeHref ?? ""}
            >
              {title}
            </ListItem>
          ) : (
            <button
              onClick={() => {
                toggleMenu();
                updateLayoutDialogState({
                  coming_soon: { isOpen: true, serviceName: name },
                });
              }}
              className={`w-full text-left`}
            >
              {title}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NavMenuItem;
