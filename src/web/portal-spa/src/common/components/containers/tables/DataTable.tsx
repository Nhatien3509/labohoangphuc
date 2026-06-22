import React from "react";

import {
  type Column,
  type ColumnDef,
  type Row,
  type Table as TableType,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@common/components/ui/table";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function DataTable<T>({
  table,
  columns,
  noResultsMessage,
  wrapperClassName,
  cellClassName,
  cellInnerClassName,
  headerRowClassName,
  bodyRowClassName,
  tableWrapperRef,
  hasSize = true,
  hasRightShadow = false,
  hasLeftShadow = false,
  isLoading = false,
  renderExpandedRow,
}: {
  table: TableType<T>;
  columns: ColumnDef<T>[];
  noResultsMessage?: string;
  wrapperClassName?: string;
  cellClassName?: string;
  cellInnerClassName?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string;
  tableWrapperRef?: React.Ref<HTMLDivElement>;
  hasSize?: boolean;
  hasRightShadow?: boolean;
  hasLeftShadow?: boolean;
  isLoading?: boolean;
  renderExpandedRow?: (row: Row<T>) => React.ReactNode;
} & React.ComponentProps<"table">) {
  const { t } = useLayoutStore((state) => state);

  const getCommonPinningStyles = (column: Column<T>): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
      isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRightPinnedColumn =
      isPinned === "right" && column.getIsFirstColumn("right");

    return {
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      position: isPinned ? "sticky" : undefined,
      zIndex: isPinned ? 1 : undefined,
      ...(hasRightShadow &&
        isFirstRightPinnedColumn && {
          boxShadow: "var(--D-X-3-Y0-B2-S0-30)",
        }),
      ...(hasLeftShadow &&
        isLastLeftPinnedColumn && {
          boxShadow: "var(--D-X3-Y0-B2-S0-30)",
        }),
    };
  };

  const getTableContent = () => {
    const rows = table.getRowModel().rows;

    if (isLoading) {
      return rows.map((row) => (
        <TableRow key={row.id} className="h-11">
          <TableCell
            className="pointer-events-none h-[2.8125rem]"
            colSpan={columns.length}
          >
            <div className="h-full animate-shimmer rounded bg-shimmer-gradient bg-[length:200%_100%]" />
          </TableCell>
        </TableRow>
      ));
    }

    if (rows.length) {
      return rows.map((row) => (
        <React.Fragment key={row.id}>
          <TableRow
            data-state={
              (row.getIsSelected() || row.getIsAllSubRowsSelected()) &&
              "selected"
            }
            className={bodyRowClassName}
          >
            {row.getVisibleCells().map((cell) => {
              return (
                <TableCell
                  className={cellClassName}
                  key={cell.id}
                  style={{
                    ...(hasSize && {
                      width: cell.column.getSize(),
                      ...getCommonPinningStyles(cell.column),
                    }),
                  }}
                >
                  {cellInnerClassName ? (
                    <div className={cellInnerClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              );
            })}
          </TableRow>

          {row.getIsExpanded() && renderExpandedRow && (
            <TableRow data-state="expanded">
              <TableCell className="p-0" colSpan={columns.length}>
                {renderExpandedRow(row)}
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ));
    }

    return (
      <TableRow className="h-11">
        <TableCell
          className="h-11 border-none text-center italic text-neutral-800"
          colSpan={columns.length}
        >
          {noResultsMessage ?? t("common.no_data")}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Table
      tableWrapperRef={tableWrapperRef}
      wrapperClassName={wrapperClassName}
      style={{
        ...(hasSize && {
          width: table.getTotalSize(),
        }),
      }}
    >
      <TableHeader className="sticky top-0 z-[2] overflow-hidden">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn(
              "bg-neutral-0 hover:bg-neutral-100",
              "dark:bg-neutral-dark-0 dark:hover:bg-neutral-dark-0",
              headerRowClassName,
            )}
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  style={{
                    ...(hasSize && { width: header.getSize() }),
                    ...getCommonPinningStyles(header.column),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody
        className={cn({
          "[&_tr:last-child]:border-0": !table.getRowModel().rows.length,
        })}
      >
        {getTableContent()}
      </TableBody>
    </Table>
  );
}
