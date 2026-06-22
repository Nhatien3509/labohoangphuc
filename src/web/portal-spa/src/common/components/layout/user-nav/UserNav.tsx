import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Button } from "@common/components/ui/button";

import { Alert, Key, Log, Profile } from "@common/components/icons";
import ProfileButton from "@common/components/layout/buttons/ProfileButton";
import SignInButton from "@common/components/layout/buttons/SignInButton";
import SignOutButton from "@common/components/layout/buttons/SignOutButton";
import UserNavMenuItem from "@common/components/layout/user-nav/UserNavMenuItem";
import UserNavQuickAccess from "@common/components/layout/user-nav/UserNavQuickAccess";
import UserNavSettings from "@common/components/layout/user-nav/UserNavSettings";

import { type SessionData, getSession } from "@common/lib/core/auth";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { env } from "@/env";
import { getFeatureFlags } from "@common/lib/feature-flags/server";
import { getTranslations } from "next-intl/server";

export default async function UserNav() {
  const t = await getTranslations("layout");
  const { isLoggedIn } = await getSession<SessionData>("session");

  const [isMonitoringEnabled, isLogsEnabled, isPatEnabled] = getFeatureFlags([
    "monitoring.enabled",
    "logs.enabled",
    "pat.enabled",
  ]);

  const MENU = [
    {
      id: "account",
      icon: <Profile />,
      newTab: true,
      label: t("user_nav.account"),
      link: env.KEYCLOAK_ISSUER + "/account",
      isHidden: false,
    },
    {
      id: "monitoring",
      icon: <Alert />,
      newTab: false,
      label: t("user_nav.monitoring"),
      link: "#",
      isHidden: !isMonitoringEnabled,
    },
    {
      id: "logs",
      icon: <Log />,
      newTab: false,
      label: t("user_nav.logs"),
      link: "#",
      isHidden: !isLogsEnabled,
    },
    {
      id: "pat",
      icon: <Key />,
      newTab: false,
      label: t("user_nav.pat"),
      link: "#",
      isHidden: !isPatEnabled,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="tertiary"
          className={cn(
            "h-[2.875rem] w-[11.75rem] max-lg:h-fit max-lg:w-fit",
            "rounded-lg",
            "border border-neutral-100",
            "px-0 max-lg:px-3",
            "flex items-center justify-between gap-1",
            "bg-neutral-50",
            "group/item",
            "hover:border-neutral-500 hover:bg-neutral-100 hover:shadow-D-X0-Y2-B4-S0-15",
            "active:border-neutral-500 active:bg-neutral-100 active:shadow-I-X2-Y2-B4-S0-25",
            "data-[state=open]:border-neutral-500 data-[state=open]:bg-neutral-50 data-[state=open]:shadow-D-X0-Y2-B4-S0-15",
            "dark:border-neutral-dark-100 dark:bg-neutral-dark-0",
            "dark:hover:border-neutral-dark-800 dark:hover:bg-neutral-dark-50 dark:hover:text-neutral-dark-900 dark:hover:shadow-D-X0-Y2-B2-S0-30",
            "dark:active:border-neutral-dark-100 active:dark:shadow-I-X0-Y1-B4-S0-60",
            "data-[state=open]:dark:border-neutral-dark-800 data-[state=open]:dark:bg-neutral-dark-50 data-[state=open]:dark:text-neutral-dark-900 data-[state=open]:dark:shadow-D-X0-Y2-B2-S0-30",
            "focus-visible:bg-neutral-50",
            "focus:shadow-none",
            "focus-visible:shadow-none",
          )}
        >
          {isLoggedIn ? <ProfileButton /> : <SignInButton />}
        </Button>
      </DropdownMenuTrigger>

      {isLoggedIn && (
        <DropdownMenuContent
          forceMount
          align="end"
          className={cn(
            "w-[16.125rem] !rounded-b-lg rounded-t-none border-none py-2 !shadow-D-X0-Y4-B6-S0-25 dark:shadow-D-X0-Y2-B4-S0-15 max-lg:w-72",
            "scrollbar mt-[0.325rem] max-h-[60vh] overflow-auto px-0",
          )}
        >
          <DropdownMenuGroup className="flex flex-col">
            {MENU.filter((item) => !item.isHidden).map((menuItem) => (
              <UserNavMenuItem item={menuItem} key={menuItem.id} />
            ))}
          </DropdownMenuGroup>

          <UserNavQuickAccess />
          <UserNavSettings />

          <DropdownMenuItem className="p-0">
            <SignOutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
