"use client";

import AppLink from "@common/components/containers/AppLink";
import { Button } from "@common/components/ui/button";
import SkeletonContainer from "@common/components/containers/SkeletonContainer";

import React, {
  type ReactNode,
  useEffect,
  useState,
  useTransition,
} from "react";
import { cn } from "@common/lib/core/utils";

export type Tab = {
  label: ReactNode;
  content: ReactNode;
  href?: string;
};

type TabNavigatorProps = {
  tabs: Tab[];
  defaultActiveTab?: number;
  handleTabClick?: (selectedTab: number) => void;
  className?: string;
  contentClassName?: string;
};

const TabNavigator: React.FC<TabNavigatorProps> = ({
  tabs,
  handleTabClick,
  defaultActiveTab = 0,
  className = "",
  contentClassName,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [isPending, startTransition] = useTransition();

  const onTabClick = (index: number) => {
    if (activeTab === index) return;

    setActiveTab(index);
    startTransition(() => {
      handleTabClick?.(index);
    });
  };

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  return (
    <>
      <div className={className}>
        <nav className="h-full border-b border-neutral-200">
          <ul className="flex h-full">
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              const tabButton = (
                <Button
                  variant="text"
                  className={cn(
                    "h-full w-full rounded-none py-2 text-md focus:shadow-none focus:outline-none",
                    isActive
                      ? "border-b-2 border-primary-100 font-bold text-primary-100"
                      : "font-normal text-neutral-800 hover:text-primary-200 dark:text-neutral-0",
                  )}
                  {...(!tab.href && {
                    onClick: () => {
                      onTabClick(index);
                    },
                  })}
                >
                  {tab.label}
                </Button>
              );

              return (
                <li
                  key={crypto.randomUUID()}
                  className={`flex-1 cursor-pointer pb-0`}
                >
                  {tab.href ? (
                    <AppLink
                      className="h-full"
                      href={tab.href}
                      onClick={() => {
                        onTabClick(index);
                      }}
                    >
                      {tabButton}
                    </AppLink>
                  ) : (
                    tabButton
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {isPending ? (
        <SkeletonContainer skeletonCount={5} />
      ) : (
        tabs[activeTab]?.content && (
          <div className={cn("pb-0 pt-5", contentClassName)}>
            {tabs[activeTab].content}
          </div>
        )
      )}
    </>
  );
};

export default TabNavigator;
