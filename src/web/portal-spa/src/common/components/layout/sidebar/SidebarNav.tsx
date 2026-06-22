import SidebarNavItem, {
  type SidebarNavItemProps,
} from "@common/components/layout/sidebar/SidebarNavItem";

import React, { type ReactNode } from "react";

const SidebarNav = ({
  items,
  navHeader,
}: Readonly<{
  items: SidebarNavItemProps[];
  navHeader?: ReactNode;
}>) => {
  return (
    <ul className="flex grow flex-col overflow-y-auto bg-white py-2 dark:bg-neutral-dark-0 max-lg:hidden">
      {navHeader}
      {items.map((item) => (
        <SidebarNavItem key={item.pattern + item.label} {...item} />
      ))}
    </ul>
  );
};

export default SidebarNav;
