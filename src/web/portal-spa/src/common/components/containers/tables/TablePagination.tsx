"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "@common/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { type Table } from "@tanstack/react-table";
import { cn } from "@common/lib/core/utils";
import { useEffect } from "react";
import { withHydration } from "@common/components/containers/Hoc";

const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50];

interface TablePaginationProps<TData> {
  table?: Table<TData>;
  total?: number;
  currentIndex: number;
  currentSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSize?: boolean;
  id?: string;
  wrapperClassName?: string;
  isPaginationColumn?: boolean;
  pageSizeOptions?: readonly number[];
  pageSizeLabel?: string;
  pageSizeSuffix?: string;
  rangeSeparator?: string;
}

function getPageData(currentIndex: number, pageCount: number) {
  const maxVisible = 5;
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (currentIndex <= 3) {
    return [1, 2, 3, 4, 5, "ellipsis-end", pageCount] as const;
  }
  if (currentIndex >= pageCount - 2) {
    return [
      1,
      "ellipsis-start",
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ] as const;
  }
  return [
    1,
    "ellipsis-start",
    currentIndex - 1,
    currentIndex,
    currentIndex + 1,
    "ellipsis-end",
    pageCount,
  ] as const;
}

function TablePagination<TData>({
  table,
  total,
  currentIndex,
  currentSize = 10,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  wrapperClassName,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  pageSizeLabel = "Hiển thị",
  pageSizeSuffix = "mỗi trang",
  rangeSeparator = "tổng",
}: Readonly<TablePaginationProps<TData>>) {
  const totalRows = total ?? table?.getRowCount() ?? 0;
  const pageCount = Math.max(
    1,
    Math.ceil(totalRows / Math.max(1, currentSize)),
  );
  const offset = (currentIndex - 1) * currentSize;
  const minCount = totalRows === 0 ? 0 : offset + 1;
  const maxCount = Math.min(currentIndex * currentSize, totalRows);

  useEffect(() => {
    if (!table) return;
    table.setPagination({
      pageIndex: table.getState().pagination.pageIndex,
      pageSize: currentSize,
    });
  }, []);

  const handlePageSizeChange = (size: number) => {
    if (size === currentSize) return;
    table?.setPagination({ pageIndex: 0, pageSize: size });
    onPageChange(1);
    onPageSizeChange?.(size);
  };

  const pages = getPageData(currentIndex, pageCount);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        wrapperClassName,
        { hidden: !totalRows },
      )}
    >
      {showPageSize ? (
        <div className="flex items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-dark-600">
          <span>{pageSizeLabel}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-[30px] min-w-[60px] items-center justify-between gap-1 rounded-[6px] border border-[#dcddde] bg-white px-2 text-[13px] text-neutral-700 hover:bg-neutral-50 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:text-neutral-dark-700"
              >
                <span>{currentSize}</span>
                <ChevronDown
                  size={12}
                  className="text-neutral-400 dark:text-neutral-dark-400"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[60px]">
              {pageSizeOptions.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => {
                    handlePageSizeChange(s);
                  }}
                  className={cn(
                    "text-[13px]",
                    currentSize === s && "font-medium text-blue-700",
                  )}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>{pageSizeSuffix}</span>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <span className="whitespace-nowrap text-[13px] text-neutral-500 dark:text-neutral-dark-500">
          {minCount}-{maxCount} {rangeSeparator} {totalRows}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentIndex === 1}
            onClick={() => {
              if (currentIndex > 1) onPageChange(currentIndex - 1);
            }}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-100"
          >
            <ChevronLeft size={14} />
          </button>
          {pages.map((item, idx) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`${item}-${idx}`}
                  className="flex h-7 min-w-[28px] items-center justify-center text-[13px] text-neutral-400 dark:text-neutral-dark-400"
                >
                  ...
                </span>
              );
            }
            const isActive = item === currentIndex;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onPageChange(item);
                }}
                disabled={isActive}
                className={cn(
                  "flex h-7 min-w-[28px] items-center justify-center rounded-[6px] px-2 text-[13px]",
                  isActive
                    ? "bg-blue-700 font-medium text-white"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-100",
                )}
              >
                {item}
              </button>
            );
          })}
          <button
            type="button"
            disabled={currentIndex >= pageCount}
            onClick={() => {
              if (currentIndex < pageCount) onPageChange(currentIndex + 1);
            }}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-100"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default withHydration(TablePagination) as <TData>(
  props: TablePaginationProps<TData>,
) => React.JSX.Element;
