// For mobile resolutions

"use client";

import { RadioGroup, RadioGroupItem } from "@common/components/ui/radio-group";
import { Label } from "@common/components/ui/label";

import UserNavDropdownItem from "@common/components/layout/user-nav/UserNavDropdownItem";

import {
  I18N,
  switchLocale,
} from "@common/components/layout/buttons/LocaleSwitch";
import React, { cloneElement } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useTheme } from "next-themes";
import { useTransitionNav } from "@common/hooks/useTransitionNav";

function UserNavSettings() {
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();
  const { locale } = useParams<{ locale: string }>();
  const { theme, setTheme } = useTheme();
  const { t } = useLayoutStore((state) => state);
  const { isRedirecting, replace } = useTransitionNav();

  return (
    <UserNavDropdownItem
      title={t("user_nav.settings")}
      className="cursor-pointer rounded-none border-t border-t-neutral-100 lg:hidden"
    >
      <div className="cursor-auto py-[0.3125rem]">
        <div className="pl-6 text-base leading-4">
          <span>{t("header.select_language")}</span>
        </div>
        <RadioGroup
          name="language"
          className="grid w-full grid-cols-2 justify-between py-2"
          disabled={isRedirecting}
          onValueChange={(newLocale) => {
            switchLocale({
              currentLocale: locale,
              newLocale,
              pathname,
              searchParams,
              replace,
            });
          }}
          defaultValue={locale}
        >
          {I18N.map(({ label, flag, ...item }, index) => (
            <div
              key={item.locale}
              className={cn("col-span-1 flex items-center gap-[0.625rem]", {
                "pl-6": index % 2 === 0,
              })}
            >
              <RadioGroupItem
                id={`language-${item.locale}`}
                size={"sm"}
                value={item.locale}
              />
              <Label
                className="flex cursor-pointer items-center gap-2"
                htmlFor={`language-${item.locale}`}
              >
                {cloneElement(flag, { size: 20 })}
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="cursor-auto py-[0.3125rem]">
        <div className="pl-6 text-base leading-4">
          <span>{t("header.modes.title")}</span>
        </div>
        <RadioGroup
          name="theme"
          className="grid w-full grid-cols-2 justify-between py-2"
          disabled={isRedirecting}
          onValueChange={(newTheme) => {
            setTheme(newTheme);
          }}
          defaultValue={theme}
        >
          <div
            className={cn("col-span-1 flex items-center gap-[0.625rem] pl-6")}
          >
            <RadioGroupItem id={"theme-light"} size={"sm"} value={"light"} />
            <Label
              className="flex cursor-pointer items-center gap-2"
              htmlFor={"theme-light"}
            >
              {t("header.modes.light_responsive")}
            </Label>
          </div>
          <div className={cn("col-span-1 flex items-center gap-[0.625rem]")}>
            <RadioGroupItem id={"theme-dark"} size={"sm"} value={"dark"} />
            <Label
              className="flex cursor-pointer items-center gap-2"
              htmlFor={"theme-dark"}
            >
              {t("header.modes.dark_responsive")}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </UserNavDropdownItem>
  );
}

export default UserNavSettings;
