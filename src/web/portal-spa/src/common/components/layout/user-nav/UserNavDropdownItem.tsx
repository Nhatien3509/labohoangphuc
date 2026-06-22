"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@common/components/ui/collapsible";
import { DropdownMenuItem } from "@common/components/ui/dropdown-menu";

import { CaretDown } from "@common/components/icons";

import React, { type ReactNode, useState } from "react";
import { cn } from "@common/lib/core/utils";

function UserNavDropdownItem({
  title,
  children,
  className,
}: Readonly<{
  title: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuItem
      className="p-0"
      onSelect={(e) => {
        e.preventDefault();
      }}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("w-full", className)}
      >
        <CollapsibleTrigger asChild>
          {React.isValidElement(title) ? (
            title
          ) : (
            <p className="flex items-center justify-between py-3 pl-6 pr-3">
              <span className="leading-6">{title}</span>
              <CaretDown
                className={cn({
                  "rotate-180": isOpen,
                })}
              />
            </p>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </DropdownMenuItem>
  );
}

export default UserNavDropdownItem;
