import TooltipContainer from "@common/components/containers/TooltipContainer";

import { SortAZ, SortZA } from "@common/components/icons";

import { type Column } from "@tanstack/react-table";
import { type ReactNode } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function SortDataButton<T>({
  column,
  title,
  className,
  rightIcon,
}: Readonly<{
  column: Column<T>;
  title?: string | ReactNode;
  className?: string;
  rightIcon?: ReactNode;
}>) {
  const { t } = useLayoutStore((state) => state);
  const sortOrder = column.getIsSorted();
  const toggleSorting = () => {
    column.toggleSorting(sortOrder === "asc");
  };

  return (
    <div className={cn("group/sort flex items-center gap-1", className)}>
      <button className="btn-title" onClick={toggleSorting} tabIndex={-1}>
        <div className="select-none whitespace-nowrap px-0 text-base font-semibold text-neutral-800 dark:text-neutral-dark-900">
          {title}
        </div>
      </button>
      {rightIcon}
      <TooltipContainer content={t("common.actions.sort")} side="top">
        <button
          className={cn(
            "group/button -ml-1 rounded border border-transparent hover:text-primary-200 focus-visible:ml-0 focus-visible:border-primary-200 group-hover/sort:ml-0",
            {
              "ml-0": sortOrder,
            },
          )}
          onClick={toggleSorting}
        >
          {sortOrder === "desc" ? (
            <SortZA
              className={cn(
                "w-0 group-hover/sort:w-fit group-focus/button:w-fit",
                { "w-fit": sortOrder },
              )}
            />
          ) : (
            <SortAZ
              className={cn(
                "w-0 group-hover/sort:w-fit group-focus/button:w-fit",
                { "w-fit": sortOrder },
              )}
            />
          )}
        </button>
      </TooltipContainer>
    </div>
  );
}
