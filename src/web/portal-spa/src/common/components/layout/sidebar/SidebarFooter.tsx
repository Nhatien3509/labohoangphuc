import AppLink from "@common/components/containers/AppLink";
import CardContainer from "@common/components/containers/cards/CardContainer";

import React, { type ReactNode } from "react";

const SidebarFooter = ({ title, items }: SidebarFooterProps) => {
  return (
    <CardContainer
      contentclassName="p-0 py-3"
      className="mt-6 gap-0 max-lg:hidden"
      titleNode={<p className="text-base font-semibold uppercase">{title}</p>}
    >
      <div className="flex flex-col">
        {items.map(({ icon, label, href }) => (
          <AppLink
            key={crypto.randomUUID()}
            className="focus-visible flex items-center space-x-4 px-6 py-3 hover:bg-primary-50 focus-visible:rounded"
            href={href}
          >
            {icon}
            <span className="text-base font-medium">{label}</span>
          </AppLink>
        ))}
      </div>
    </CardContainer>
  );
};

export default SidebarFooter;

export type SidebarFooterProps = Readonly<{
  title: string;
  items: { href: string; label: string; icon: ReactNode }[];
}>;
