"use client";

import React, { type ReactNode, useState } from "react";
import type { SessionData, SsoUserInfo } from "@common/lib/core/auth";
import AppSidebar from "@common/components/layout/AppSidebar";
import AppTopBar from "@common/components/layout/AppTopBar";
import { PermissionProvider } from "@common/components/layout/providers/PermissionProvider";

export default function AppDashboardLayout({
  children,
  user,
  ssoUser,
  permissions = [],
}: Readonly<{
  children: ReactNode;
  user?: SessionData["user"];
  ssoUser?: SsoUserInfo;
  permissions?: readonly string[];
}>) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <PermissionProvider permissions={permissions}>
      <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-dark-bg">
        <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppTopBar user={user} ssoUser={ssoUser} />
          <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </PermissionProvider>
  );
}
