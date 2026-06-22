import { type SessionData, getSession } from "@common/lib/core/auth";
import AppDashboardLayout from "@common/components/layout/AppDashboardLayout";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user, ssoUser, permissions } =
    await getSession<SessionData>("session");

  return (
    <AppDashboardLayout
      user={user}
      ssoUser={ssoUser}
      permissions={permissions ?? []}
    >
      {children}
    </AppDashboardLayout>
  );
}
