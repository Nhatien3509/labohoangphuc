import * as React from "react";

import { cn } from "@common/lib/core/utils";

type TableProps = {
  wrapperClassName?: string;
  tableWrapperRef?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLTableElement>;

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, tableWrapperRef, ...props }, ref) => (
    <div
      ref={tableWrapperRef}
      className={cn(
        "scrollbar relative max-h-[31.75rem] w-full max-w-[calc(100vw-24rem)] overflow-auto max-lg:max-w-full",
        wrapperClassName,
      )}
    >
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-base", className)}
        {...props}
        style={{
          borderCollapse: "unset",
          borderSpacing: "unset",
          ...props.style,
        }}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ ...props }, ref) => <tbody ref={ref} {...props} />);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group transition-colors hover:bg-[#fbfbfb]",
      "dark:bg-neutral-dark-100 dark:text-neutral-dark-900 dark:hover:bg-neutral-dark-50",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "p-3 text-left align-middle text-base font-semibold leading-5 text-neutral-800 dark:text-neutral-dark-900 [&:has([data-is-fixed-actions-col=true])]:w-[6.125rem] [&:has([data-is-fixed-no-col=true])]:w-12 [&:has([role=checkbox])]:w-11 [&>[role=checkbox]]:translate-y-[2px]",
      "border-b [&:has(.btn-title:focus-visible)]:border [&:has(.btn-title:focus-visible)]:border-primary-100 [&:has(.btn-title:focus-visible)]:bg-neutral-100 [&:has(.btn-title:focus-visible)]:px-[0.6875rem]",
      "bg-neutral-0 transition-colors group-hover:bg-neutral-100 dark:bg-neutral-dark-0 dark:group-hover:bg-neutral-dark-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "w-[inherit] overflow-hidden text-ellipsis border-b border-neutral-100 p-3 align-middle [&:has([data-is-fixed-actions-col=true])]:w-[6.125rem] [&:has([data-is-fixed-no-col=true])]:w-12 [&>[role=checkbox]]:translate-y-[2px]",
      "bg-neutral-0 transition-colors group-hover:bg-[#fbfbfb]",
      "dark:bg-neutral-dark-100 dark:group-hover:bg-neutral-dark-50",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-base text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
