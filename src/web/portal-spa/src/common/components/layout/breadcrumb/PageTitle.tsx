"use client";

import { ArrowLeft } from "@common/components/icons";

import { cn } from "@common/lib/core/utils";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function PageTitle({
  className,
  hasBack,
}: Readonly<{
  className?: string;
  hasBack: boolean;
}>) {
  const router = useAppRouter();
  const { t } = useLayoutStore((state) => state);

  return (
    <div
      className={cn(
        "group mt-1 flex items-center hover:text-primary-200 max-lg:mt-0",
        {
          className,
        },
      )}
    >
      {hasBack && (
        <>
          <button
            onClick={() => {
              router.back();
            }}
            className="peer focus-visible focus-visible:rounded"
          >
            <ArrowLeft className="text-neutral-700 group-hover:text-primary-200 dark:text-white" />
          </button>
          <button
            tabIndex={-1}
            onClick={() => {
              router.back();
            }}
            className="border-b border-transparent pl-1 text-base font-medium peer-focus-visible:border-b peer-focus-visible:border-primary-200 dark:text-white"
          >
            {t("common.actions.back")}
          </button>
        </>
      )}
    </div>
  );
}
