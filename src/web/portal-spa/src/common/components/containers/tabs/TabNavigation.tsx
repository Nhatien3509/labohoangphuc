"use client";

import AppLink from "@common/components/containers/AppLink";

import { cn } from "@common/lib/core/utils";
import { useSelectedLayoutSegment } from "next/navigation";
type TabNavigationProps = Readonly<{
  tabs: {
    tab: string;
    label: string;
  }[];
}>;

export default function TabNavigation({ tabs }: TabNavigationProps) {
  const currentTab = useSelectedLayoutSegment();

  return (
    <nav className="h-10 border-b border-neutral-200">
      <ul className="flex">
        {tabs.map(({ tab, label }) => {
          const isActive = tab === currentTab;

          return (
            <li key={tab} className="flex-1">
              <AppLink
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-none py-2.5 text-md leading-5 hover:text-primary-200 focus:shadow-none focus:outline-none",
                  {
                    "border-b-2 border-primary-100 font-bold text-primary-100":
                      isActive,
                  },
                )}
                href={tab}
              >
                {label}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
