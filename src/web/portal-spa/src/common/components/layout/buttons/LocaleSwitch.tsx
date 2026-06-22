"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Button } from "@common/components/ui/button";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import {
  CaretDown,
  Check,
  UKFlagCircle,
  VietnamFlagCircle,
} from "@common/components/icons";

import { cloneElement, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useTransitionNav } from "@common/hooks/useTransitionNav";

export const I18N = [
  { locale: "vi", label: "VI", flag: <VietnamFlagCircle size={20} /> },
  { locale: "en", label: "EN", flag: <UKFlagCircle size={20} /> },
];

export const switchLocale = ({
  currentLocale,
  newLocale,
  pathname,
  searchParams,
  replace,
}: {
  currentLocale: string;
  newLocale: string;
  pathname: string;
  searchParams: string;
  replace: (href: string) => void;
}) => {
  if (currentLocale === newLocale) return;

  const newPathname = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, "")}`;
  const newUrl = searchParams ? `${newPathname}?${searchParams}` : newPathname;

  replace(newUrl);
};

export default function LocaleSwitch() {
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();
  const { locale } = useParams<{ locale: string }>();
  const { t } = useLayoutStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);
  const { replace, isRedirecting } = useTransitionNav();

  const currentLang = I18N.find((lang) => lang.locale === locale);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <span className="max-lg:hidden">
          <IconWithTooltip
            tooltipProps={{
              content: isOpen ? null : t("header.select_language"),
            }}
          >
            <Button
              variant="tertiary"
              className={cn(
                "flex h-[2.875rem] w-[4rem] items-center gap-1 border border-neutral-100 bg-neutral-50 py-1.5 pl-3 pr-1.5",
                "hover:border-neutral-500 hover:bg-neutral-100 active:border-neutral-500 active:bg-neutral-100",
                "data-[state=open]:border-neutral-500 data-[state=open]:bg-neutral-50",
                "dark:border-neutral-dark-100 dark:bg-neutral-dark-0 dark:text-neutral-dark-900",
                "focus-visible:bg-neutral-50 focus-visible:shadow-none",
                "rounded-lg max-lg:hidden",
              )}
            >
              <div className="flex h-6 items-center gap-1">
                {currentLang?.flag &&
                  cloneElement(currentLang.flag, {
                    size: 22,
                  })}
                <CaretDown />
              </div>
            </Button>
          </IconWithTooltip>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mt-[0.325rem] min-w-[6.125rem] rounded-t-none border-none p-0 py-2 !shadow-D-X0-Y2-B4-S0-15">
        {I18N.map(({ label, flag, ...item }) => (
          <DropdownMenuItem
            key={item.locale}
            className="group rounded-none p-0"
            disabled={isRedirecting}
            onClick={() => {
              switchLocale({
                currentLocale: locale,
                newLocale: item.locale,
                pathname,
                searchParams,
                replace,
              });
            }}
          >
            <Button
              leftIcon={flag}
              variant="text"
              className={cn(
                "h-10 w-full justify-between px-3 py-2.5 leading-5 text-neutral-800 dark:text-neutral-0",
                locale === item.locale ? "justify-between" : "justify-start",
              )}
              rightIcon={
                locale === item.locale && (
                  <Check className={cn("text-neutral-700")} size={20} />
                )
              }
            >
              <span className="group-hover:font-semibold group-hover:text-neutral-800">
                {label}
              </span>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
