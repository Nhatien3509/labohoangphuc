"use client";

import SidebarFooter, {
  type SidebarFooterProps,
} from "@common/components/layout/sidebar/SidebarFooter";
import SidebarDropdown from "@common/components/layout/sidebar/SidebarDropdown";
import SidebarHeader from "@common/components/layout/sidebar/SidebarHeader";
import SidebarNav from "@common/components/layout/sidebar/SidebarNav";

import React from "react";
import type { SidebarNavItemProps } from "@common/components/layout/sidebar/SidebarNavItem";

const Sidebar = ({
  title,
  subtitle,
  logo,
  items,
  footerProps,
}: Readonly<{
  title: string;
  subtitle?: string;
  logo?: string;
  items: SidebarNavItemProps[];
  footerProps?: SidebarFooterProps;
}>) => {
  return (
    <aside className="flex w-64 flex-col rounded-lg border border-neutral-100 bg-white shadow-sm dark:border-neutral-dark-100 dark:bg-neutral-dark-0 lg:min-h-[calc(100vh-9rem)]">
      <SidebarDropdown title={title} items={items} />
      <SidebarHeader title={title} subtitle={subtitle} logo={logo} />
      <SidebarNav items={items} />
      {footerProps && <SidebarFooter {...footerProps} />}
    </aside>
  );
};

export default Sidebar;
