// For mobile resolutions

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Button } from "@common/components/ui/button";

import { ChevronDown, ChevronUp } from "@common/components/icons";
import SidebarDropdownItem from "@common/components/layout/sidebar/SidebarDropdownItem";

import React from "react";
import { type SidebarNavItemProps } from "@common/components/layout/sidebar/SidebarNavItem";

function SidebarDropdown({
  title,
  items,
}: Readonly<{
  title: string;
  items: SidebarNavItemProps[];
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {React.isValidElement(title) ? (
          title
        ) : (
          <Button
            variant={"tertiary"}
            className="group flex h-fit items-center justify-between rounded-none border-none !bg-neutral-0 py-[1.125rem] pl-6 pr-3 !shadow-none lg:hidden"
          >
            <span className="from-white text-md font-bold uppercase">
              {title}
            </span>
            <ChevronDown className={"group-data-[state=open]:hidden"} />
            <ChevronUp className={"group-data-[state=closed]:hidden"} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-t-none border-none px-0 py-3 dropdown-content-width-full lg:hidden">
        <DropdownMenuGroup className="flex flex-col">
          {items.map((item) => (
            <SidebarDropdownItem key={item.pattern} {...item} />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SidebarDropdown;
