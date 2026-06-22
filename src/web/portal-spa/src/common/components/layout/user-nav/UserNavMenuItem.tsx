"use client";

import AppLink from "@common/components/containers/AppLink";
import { Button } from "@common/components/ui/button";
import { DropdownMenuItem } from "@common/components/ui/dropdown-menu";

import React, { cloneElement } from "react";

type ItemType = {
  id: string;
  icon: React.JSX.Element;
  newTab: boolean;
  label: string;
  link: string;
  isHidden: boolean;
};

function UserNavMenuItem({ item }: Readonly<{ item: ItemType }>) {
  return (
    <AppLink
      className="block w-full"
      href={item.link}
      target={item.newTab ? "_blank" : "_self"}
      rel={item.newTab ? "noopener noreferrer" : undefined}
    >
      <Button variant={"tertiary"} className="h-fit w-full border-none p-0">
        <DropdownMenuItem className="group/item flex h-12 w-full cursor-pointer rounded-none py-[5px] pl-6 pr-3">
          <div className="flex w-full items-center gap-3">
            <div>
              {cloneElement(item.icon as React.ReactElement, {
                className: "text-neutral-700 dark:text-neutral-dark-900",
              })}
            </div>
            <span className="w-full text-left text-sm font-normal leading-6 text-neutral-800 group-hover/item:font-semibold">
              {item.label}
            </span>
          </div>
        </DropdownMenuItem>
      </Button>
    </AppLink>
  );
}

export default UserNavMenuItem;
