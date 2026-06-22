"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@common/components/ui/collapsible";

import React, { type ReactNode, useState } from "react";

type CollapsibleContainerProps = {
  titleNode: ReactNode;
  children: ReactNode;
};

const CollapsibleContainer = ({
  titleNode,
  children,
}: CollapsibleContainerProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {titleNode && !open && (
        <CollapsibleTrigger asChild>
          <div className="flex flex-col gap-2">
            {typeof titleNode === "string" ? (
              <p className="text-base text-neutral-0">{titleNode}</p>
            ) : (
              <>{titleNode}</>
            )}
          </div>
        </CollapsibleTrigger>
      )}
      <CollapsibleContent
        onClick={() => {
          setOpen(false);
        }}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleContainer;
