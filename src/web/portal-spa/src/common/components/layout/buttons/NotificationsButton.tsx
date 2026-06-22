"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Button } from "@common/components/ui/button";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Notifications, Settings } from "@common/components/icons";

import React, { Fragment } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function NotificationsButton() {
  const { t } = useLayoutStore((state) => state);

  const NOTIFICATIONS = [
    {
      id: "notif-1",
      label: t("header.notifications.label_placeholder"),
      content: t("header.notifications.content_placeholder"),
      time: "16:00 - 20/03/2024",
      hasRead: false,
    },
    {
      id: "notif-2",
      label: t("header.notifications.label_placeholder"),
      content: t("header.notifications.content_placeholder"),
      time: "16:00 - 20/03/2024",
      hasRead: false,
    },
    {
      id: "notif-3",
      label: t("header.notifications.label_placeholder"),
      content: t("header.notifications.content_placeholder"),
      time: "16:00 - 20/03/2024",
      hasRead: true,
    },
    {
      id: "notif-4",
      label: t("header.notifications.label_placeholder"),
      content: t("header.notifications.content_placeholder"),
      time: "16:00 - 20/03/2024",
      hasRead: true,
    },
  ];

  const SETTINGS = [
    {
      id: "setting-notif-1",
      label: t("header.notifications.settings.mark_as_read"),
      link: "/",
    },
    {
      id: "setting-notif-2",
      label: t("header.notifications.settings.view_all"),
      link: "/",
    },
    {
      id: "setting-notif-3",
      label: t("header.notifications.settings.title"),
      link: "/",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="text"
          className={cn(
            "p-0",
            "text-neutral-500 active:shadow-none dark:text-neutral-dark-300 dark:focus:shadow-none",
            "data-[state=close]:text-blue-500 data-[state=open]:text-primary-200",
          )}
        >
          <IconWithTooltip
            tooltipProps={{
              content: t("header.notifications.title"),
            }}
          >
            <Notifications />
          </IconWithTooltip>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        forceMount
        align="end"
        alignOffset={-28}
        className={cn(
          "w-[20.625rem] rounded-lg rounded-t-none border-0 !shadow-D-X0-Y4-B6-S0-25 dark:shadow-D-X0-Y2-B4-S0-15",
          "flex flex-col gap-6",
          "mt-2 pb-3 pl-6 pr-4 pt-0",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-6 space-y-0 border-b border-b-neutral-100 pt-2",
          )}
        >
          <h3 className="w-full pb-2.5 pt-2.5 text-xl font-semibold tracking-normal">
            {t("header.notifications.title")}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"text"}
                className={cn(
                  "focus-visible:ring-none p-0 text-neutral-800",
                  "hover:bg-transparent hover:text-primary-200 active:shadow-none data-[state=open]:text-primary-200",
                  "focus:shadow-none",
                  "dark:text-neutral-dark-900",
                  "dark:focus:shadow-none",
                )}
              >
                <IconWithTooltip
                  tooltipProps={{
                    content: t("header.notifications.settings.title"),
                  }}
                >
                  <Settings size={24} />
                </IconWithTooltip>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              forceMount
              align="end"
              alignOffset={-8}
              className={cn(
                "w-[11.4375rem] border-none",
                "rounded-lg py-3 pl-4 pr-3",
                "-mt-1",
                "!shadow-D-X0-Y0-B10-S0-30 dark:bg-neutral-dark-50 dark:text-neutral-dark-900 dark:shadow-D-X0-Y0-B6-S0-30",
              )}
            >
              <DropdownMenuGroup className="flex flex-col gap-4">
                {SETTINGS.map((menuItem) => (
                  <DropdownMenuItem
                    key={menuItem.id}
                    className="flex cursor-pointer p-0"
                  >
                    <span className="text-sm font-normal">
                      {menuItem.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenuGroup className="flex flex-col gap-4">
          {NOTIFICATIONS.map((menuItem, index) => (
            <Fragment key={menuItem.id}>
              <DropdownMenuItem
                className={cn(
                  "box-border flex cursor-pointer items-center justify-between gap-6 border-b border-b-neutral-100 p-0",
                  index === NOTIFICATIONS.length - 1 && "!border-b-0",
                  "max-h-[4.75rem]",
                )}
              >
                <div className="flex flex-col gap-1 pb-2">
                  <span
                    className={cn(
                      "text-base",
                      menuItem.hasRead ? "font-normal" : "font-extrabold",
                    )}
                  >
                    {menuItem.label}
                  </span>
                  <span
                    className={cn(
                      "text-base",
                      menuItem.hasRead ? "font-normal" : "font-extrabold",
                    )}
                  >
                    {menuItem.content}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-5",
                      menuItem.hasRead ? "font-normal" : "font-extrabold",
                    )}
                  >
                    {menuItem.time}
                  </span>
                </div>
                {!menuItem.hasRead && (
                  <div className="h-2 w-2 rounded-full bg-primary-100" />
                )}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
