import { Button } from "@common/components/ui/button";
import CardContainer from "@common/components/containers/cards/CardContainer";
import { CardTitle } from "@common/components/ui/card";
import TabNavigation from "@common/components/containers/tabs/TabNavigation";

import { CaretDown } from "@common/components/icons";

import React, { type ReactNode } from "react";

const TabContainer = ({
  children,
  tabs,
  title,
  actionBtn,
}: Readonly<{
  children: ReactNode;
  tabs: {
    tab: string;
    label: string;
  }[];
  title?: string;
  actionBtn?: ReactNode;
}>) => (
  <div className="space-y-3">
    <CardContainer
      titleNode={
        <div className="flex items-center justify-between justify-items-center">
          <CardTitle className="h-9 text-xl leading-8">{title}</CardTitle>
          {actionBtn}
        </div>
      }
    >
      <TabNavigation tabs={tabs} />
      {children}
    </CardContainer>
  </div>
);

export function InstanceActionButton({ label }: { readonly label: string }) {
  return (
    <Button
      rightIcon={<CaretDown />}
      variant="tertiary"
      className="aria-expanded:pointer aria-expanded:bg-neutral-100 aria-expanded:shadow-I-X2-Y2-B4-S0-25"
    >
      <span className="w-[4.25rem]">{label}</span>
    </Button>
  );
}

export default TabContainer;
