"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@common/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@common/components/ui/collapsible";

import { ChevronDown, ChevronUp } from "@common/components/icons";

import React, { useEffect, useState } from "react";
import { type CardContainerProps } from "@common/components/containers/cards/CardContainer";
import { cn } from "@common/lib/core/utils";

type CollapsibleCardContainerProps = {
  defaultOpen?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  disableCollapsible?: boolean;
} & CardContainerProps;

const CollapsibleCardContainer = ({
  defaultOpen = false,
  className = "p-6",
  description,
  titleNode,
  children,
  headerClassName = "p-0",
  contentClassName = "p-0",
  disableCollapsible = false,
  ...props
}: CollapsibleCardContainerProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (disableCollapsible) setIsOpen(true);
  }, [disableCollapsible]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(disableCollapsible || open);
      }}
    >
      <Card className={cn("shadow-D-X0-Y2-B4-S0-15", className)} {...props}>
        {titleNode && (
          <CollapsibleTrigger asChild>
            <CardHeader
              className={cn(
                "space-y-0",
                { "cursor-pointer": !disableCollapsible },
                headerClassName,
              )}
            >
              <div
                className={`flex items-center justify-between gap-3 ${isOpen ? "pb-[0.6875rem]" : ""}`}
              >
                {typeof titleNode === "string" ? (
                  <div className="flex w-full flex-col gap-2">
                    <CardTitle className="text-lg leading-8 tracking-normal">
                      {titleNode}
                    </CardTitle>
                    {description && isOpen && (
                      <CardDescription className="text-neutral-400">
                        {description}
                      </CardDescription>
                    )}
                  </div>
                ) : (
                  <>{titleNode}</>
                )}

                {disableCollapsible ? (
                  <></>
                ) : (
                  <div
                    className={cn(
                      "cursor-pointer rounded-sm border bg-neutral-100 text-neutral-500 dark:bg-neutral-dark-50 dark:text-neutral-dark-500",
                      "hover:bg-neutral-200 hover:text-neutral-0",
                      "size-8 hover:dark:bg-neutral-dark-100 hover:dark:text-neutral-dark-900",
                      "grid place-items-center",
                      "focus:shadow-I-X0-Y0-B4-S0-25 active:shadow-I-X0-Y0-B4-S0-25",
                      "base-transition",
                    )}
                  >
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </div>
                )}
              </div>
              <div
                className={`border-b border-neutral-100 ${isOpen ? "" : "hidden"}`}
              ></div>
            </CardHeader>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent forceMount className="data-[state=closed]:hidden">
          <CardContent className={contentClassName}>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default CollapsibleCardContainer;
