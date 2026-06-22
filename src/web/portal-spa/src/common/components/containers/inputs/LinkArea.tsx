"use client";

import AppLink from "@common/components/containers/AppLink";
import { Label } from "@common/components/ui/label";

import React from "react";
import { cn } from "@common/lib/core/utils";

export type LinkItem = {
  text: string;
  href: string;
};

interface LinkAreaProps {
  links: LinkItem[];
  label?: string;
  separator?: string;
  className?: string;
}

export const LinkArea: React.FC<LinkAreaProps> = ({
  links,
  label,
  separator = ", ",
  className,
}) => {
  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
      <div
        className={cn(
          "scrollbar min-h-24 w-full resize-y overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-neutral-100 px-3 py-2 text-base font-medium",
          className,
        )}
      >
        {links.map((link, index) => (
          <React.Fragment key={`${link.href}-${index}`}>
            <AppLink
              href={link.href}
              className="cursor-pointer break-all text-base text-neutral-800 underline hover:text-destructive hover:dark:text-white"
            >
              {link.text}
            </AppLink>
            {index < links.length - 1 && separator}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
