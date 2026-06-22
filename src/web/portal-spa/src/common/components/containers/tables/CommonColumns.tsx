import { Button, type ButtonProps } from "@common/components/ui/button";
import AppLink from "@common/components/containers/AppLink";
import { Checkbox } from "@common/components/ui/checkbox";
import SortDataButton from "@common/components/containers/tables/SortDataButton";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";

import { Delete } from "@common/components/icons";

import {
  type Column,
  type ColumnDef,
  type Row,
  type Table,
} from "@tanstack/react-table";
import { type HTMLAttributes, type ReactNode } from "react";
import {
  localeAlphanumericSort,
  splitRowNumber,
} from "@common/lib/helpers/table";
import { cn } from "@common/lib/core/utils";
import { formatDatetime } from "@common/lib/helpers/datetime";
import { getStatusColor } from "@common/lib/helpers/str";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { withExtraProps } from "@common/components/containers/Hoc";

export const AccessorKeys = {
  ROW_NUMBER: "rowNumber",
  ID: "id",
  CREATED_AT: "createdAt",
  NAME: "name",
  SELECT: "select",
  ACTIONS: "actions",
} as const;

function getValue(
  obj: string | Record<string, string | Record<string, string>>,
  accessorKey: string,
) {
  return accessorKey
    .split(".")
    .reduce(
      (acc, key) => (typeof acc === "object" ? (acc[key] ?? "") : ""),
      obj,
    );
}

type ActionsColumnPayload<T> = {
  key: string;
  className?: string;
  classNameButton?: string;
  allowDelete?: boolean;
  title?: string;
  isSorted?: boolean;
  isDisabled?: boolean;
  callback?: (params: Row<T>) => void;
  component?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonProps["variant"];
  tooltipText?: string;
  tooltipAlign?: "start" | "center" | "end";
};

export function CommonHeader<T>({
  column,
  title,
  className,
  isSorted = false,
  rightIcon,
  isFixedNoCol = false,
  isFixedActionsCol = false,
}: {
  column: Column<T>;
  title: ReactNode;
  className?: string;
  isSorted?: boolean;
  rightIcon?: ReactNode;
  isFixedNoCol?: boolean;
  isFixedActionsCol?: boolean;
}) {
  return isSorted ? (
    <SortDataButton<T>
      className={className}
      column={column}
      rightIcon={rightIcon}
      title={title}
    />
  ) : (
    <div
      className={cn("text-base font-semibold", className)}
      {...{
        "data-is-fixed-no-col": isFixedNoCol,
        "data-is-fixed-actions-col": isFixedActionsCol,
      }}
    >
      {title}
      {rightIcon}
    </div>
  );
}

const DateTimeCell = <T,>({
  row,
  accessorKey,
  className,
}: {
  row: Row<T>;
  accessorKey: string;
  className?: string;
}) => {
  const dateTime = row.original[accessorKey as keyof T]
    ? new Date(row.original[accessorKey as keyof T] as string)
    : null;
  return (
    <div className={`whitespace-nowrap text-left ${className}`}>
      {formatDatetime(dateTime)}
    </div>
  );
};

export const NameCell = <T,>({
  row,
  accessorKey = "name",
  pathDetail,
  idKey = "id",
  size,
  rootFontSize,
  isAllowedAction = true,
}: {
  row: Row<T>;
  accessorKey?: string;
  pathDetail?: string;
  idKey?: string;
  size?: number;
  rootFontSize?: number;
  isAllowedAction?: boolean;
}) => {
  const name = getValue(
    row.original as Record<string, string | Record<string, string>>,
    accessorKey,
  ) as string;
  const id = getValue(
    row.original as Record<string, string | Record<string, string>>,
    idKey,
  ) as string;
  const cellPaddingYByRem = 1.5;
  const defaultCellWidthByRem = 15;
  const maxWidth =
    size && rootFontSize
      ? Math.round(size) / rootFontSize - cellPaddingYByRem
      : defaultCellWidthByRem;

  if (!pathDetail || !id)
    return (
      <TooltipText
        className="w-fit"
        isPreventDefault={false}
        maxWidth={maxWidth}
        content={name}
      />
    );

  return (
    <AppLink
      onClick={(e) => {
        if (!isAllowedAction) e.preventDefault();
      }}
      href={`${pathDetail}/${id}`}
      className="focus-visible focus-visible:-mx-1.5 focus-visible:block focus-visible:w-fit focus-visible:rounded focus-visible:px-1.5"
    >
      <TooltipText
        className="-mt-1 h-5 w-fit font-medium leading-6 underline underline-offset-4 hover:font-semibold focus-visible:font-semibold"
        isPreventDefault={false}
        maxWidth={maxWidth}
        content={name}
      />
    </AppLink>
  );
};

const SelectCheckbox = ({
  isAllowedAction,
  tooltipContent,
  disableTooltip,
  ...props
}: {
  isAllowedAction: boolean;
  tooltipContent: string;
  disableTooltip?: string;
} & React.ComponentProps<typeof Checkbox>) =>
  !isAllowedAction || (props.disabled && disableTooltip) ? (
    <TooltipContainer
      content={
        isAllowedAction ? (disableTooltip ?? tooltipContent) : tooltipContent
      }
      align="start"
    >
      <div className="flex items-center justify-center">
        <Checkbox disabled {...props} />
      </div>
    </TooltipContainer>
  ) : (
    <div className="flex items-center justify-center">
      <Checkbox {...props} />
    </div>
  );

export const ProgressCell = ({
  percentage,
  children,
  min = 70,
  max = 90,
  className,
  progressClassName,
  barClassName,
}: {
  percentage: number;
  children: React.ReactNode;
  min?: number;
  max?: number;
  className?: string;
  progressClassName?: string;
  barClassName?: string;
}) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const barClass = cn("h-2 rounded transition-all", {
    "bg-neutral-100": clamped === 0,
    "bg-green-800": clamped > 0 && clamped <= min,
    "bg-orange-800": clamped > min && clamped <= max,
    "bg-red-800": clamped > max,
  });

  return (
    <div className={cn("flex items-center pr-8", className)}>
      <div
        className={cn(
          "h-2 w-[15rem] overflow-hidden rounded bg-neutral-100",
          progressClassName,
        )}
      >
        <div
          className={cn(barClass, barClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="ml-2">{children}</span>
    </div>
  );
};

export const SelectCell = <T,>({
  row,
  isAllowedAction,
  getDisableTooltip,
}: Readonly<{
  row: Row<T>;
  isAllowedAction: boolean;
  getDisableTooltip?: (row: Row<T>) => string;
}>) => {
  const { t } = useLayoutStore((state) => state);
  return (
    <SelectCheckbox
      isAllowedAction={isAllowedAction}
      tooltipContent={t("common.allowed_actions.no_perform")}
      checked={row.getIsSelected()}
      name={`select-${row.id}`}
      onCheckedChange={row.getToggleSelectedHandler()}
      disabled={!isAllowedAction || !row.getCanSelect()}
      className="focus-visible focus-visible:ring-offset-2"
      disableTooltip={getDisableTooltip?.(row)}
    />
  );
};

const SelectHeader = <T,>({
  table,
  isAllowedAction,
}: Readonly<{ table: Table<T>; isAllowedAction: boolean }>) => {
  const { t } = useLayoutStore((state) => state);
  return (
    <SelectCheckbox
      isAllowedAction={isAllowedAction}
      tooltipContent={t("common.allowed_actions.no_perform")}
      checked={
        table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected()
      }
      name="select-all"
      onClick={table.getToggleAllRowsSelectedHandler()}
      disabled={
        !isAllowedAction ||
        !table.getRowModel().rows.some((row) => row.getCanSelect())
      }
      className="focus-visible focus-visible:ring-offset-2"
    />
  );
};

const RowNumberCell = <T,>({
  row,
  table,
  page,
  pageSize,
}: {
  row: Row<T>;
  table: Table<T>;
  page: number;
  pageSize: number;
}) => {
  const rowNumber =
    (page - 1) * pageSize +
    (table
      .getSortedRowModel()
      .flatRows.findIndex((flatRow) => flatRow.id === row.id) || 0) +
    1;
  return (
    <div
      className={"break-all text-center"}
      data-is-fixed-no-col="true"
      dangerouslySetInnerHTML={{ __html: splitRowNumber(String(rowNumber)) }}
    ></div>
  );
};

export const StatusCell = <T extends Record<string, unknown>>({
  row,
  hasTranslation,
  accessorKey,
  cellClassName,
}: {
  row: Row<T>;
  hasTranslation?: boolean;
  accessorKey?: keyof T;
  cellClassName?: string;
}) => {
  const status = String(
    accessorKey ? row.original[accessorKey] : row.original.status,
  );

  return (
    <StatusBadge
      {...{
        status,
        hasTranslation,
      }}
      className={cellClassName}
    />
  );
};

export const StatusBadge = ({
  className,
  status,
  hasTranslation,
}: HTMLAttributes<HTMLDivElement> & {
  status: string;
  hasTranslation?: boolean;
}) => {
  const { bgColor, label } = getStatusColor(status);
  const { t } = useLayoutStore((state) => state);

  return (
    <div
      className={cn(
        "h-7 w-fit whitespace-nowrap rounded px-2 py-1 text-base text-neutral-0",
        bgColor,
        className,
      )}
    >
      {hasTranslation ? t(`common.status.${label.toLowerCase()}`) : label}
    </div>
  );
};

export const CommonCell = <T,>({
  row,
  className,
  accessorKey,
  dataCell,
  widthThreshold,
  size,
  rootFontSize,
}: {
  row: Row<T>;
  className?: string;
  accessorKey?: string;
  dataCell?: (row: T) => string | number;
  widthThreshold?: number;
  size?: number;
  rootFontSize?: number;
}) => {
  let defaultRootFontSize = 16;
  if (typeof window !== "undefined") {
    defaultRootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
  }
  const cellPaddingYByRem = 1.5;
  const maxWidth = size
    ? size / (rootFontSize ?? defaultRootFontSize) - cellPaddingYByRem
    : undefined;
  const value =
    dataCell?.(row.original) ?? (accessorKey && row.getValue(accessorKey));

  return widthThreshold || maxWidth ? (
    <TooltipText
      className={cn("w-fit text-left", className)}
      maxWidth={widthThreshold ?? maxWidth}
      content={String(value ?? "")}
    />
  ) : (
    <div className={cn("text-left", className)}>{value}</div>
  );
};

export function idColumn<T>(
  title: string,
  isSorted = false,
  size?: number,
  rootFontSize?: number,
): ColumnDef<T> {
  return {
    accessorKey: AccessorKeys.ID,
    header: withExtraProps(CommonHeader, { title, isSorted }),
    cell: withExtraProps(CommonCell<T>, {
      accessorKey: AccessorKeys.ID,
      size: size ? Math.round(size) : undefined,
      rootFontSize,
    }),
    sortingFn: localeAlphanumericSort,
    size,
  };
}

export function dateTimeColumn<T>(
  title: string,
  isSorted = false,
  accessorKey: string = AccessorKeys.CREATED_AT,
  classNameCell?: string,
  size?: number,
): ColumnDef<T> {
  return {
    accessorKey,
    header: withExtraProps(CommonHeader, { isSorted, title }),
    cell: withExtraProps(DateTimeCell, {
      accessorKey,
      className: classNameCell,
    }),
    size,
  };
}
type NameColumnOptions = { accessorKey?: string; idKey?: string };

export function nameColumn<T>(
  title: string,
  isSorted = false,
  pathDetail?: string,
  size?: number,
  rootFontSize?: number,
  isAllowedAction?: boolean,
  { accessorKey, idKey }: NameColumnOptions = {},
): ColumnDef<T> {
  return {
    header: withExtraProps(CommonHeader, { isSorted, title }),
    accessorKey: accessorKey ?? AccessorKeys.NAME,
    cell: withExtraProps(NameCell, {
      pathDetail,
      size,
      rootFontSize,
      isAllowedAction,
      accessorKey,
      idKey,
    }),
    sortingFn: localeAlphanumericSort,
    size,
  };
}

export function selectColumn<T>(
  isAllowedAction = true,
  getDisableTooltip?: (row: Row<T>) => string,
): ColumnDef<T> {
  return {
    accessorKey: AccessorKeys.SELECT,
    header: withExtraProps(SelectHeader, { isAllowedAction }),
    cell: withExtraProps(SelectCell<T>, { isAllowedAction, getDisableTooltip }),
    size: 44,
  };
}

export function rowNumberColumn<T>({
  page,
  pageSize,
  title,
  accessorKey,
  size,
}: {
  page: number;
  pageSize: number;
  title: string;
  accessorKey?: string;
  size?: number;
}): ColumnDef<T> {
  return {
    accessorKey: accessorKey ?? AccessorKeys.ROW_NUMBER,
    header: withExtraProps(CommonHeader, {
      title,
      className: "text-center",
      isFixedNoCol: true,
    }),
    cell: withExtraProps(RowNumberCell, { page, pageSize }),
    size: size ?? 59,
  };
}

export function actionsColumn<T>({
  icon = <Delete size={20} />,
  variant = "text",
  ...payload
}: ActionsColumnPayload<T>): ColumnDef<T> {
  return {
    id: AccessorKeys.ACTIONS,
    accessorKey: AccessorKeys.ACTIONS,
    header: withExtraProps(CommonHeader, {
      title: payload.title,
      className: payload.className ?? "",
      isFixedActionsCol: true,
    }),
    cell: ({ row }) => {
      return (
        <div
          className="flex items-center justify-center text-center"
          data-is-fixed-actions-col="true"
        >
          {payload.tooltipText || !payload.allowDelete ? (
            <TooltipContainer
              content={payload.tooltipText}
              align={payload.tooltipAlign}
            >
              <span>
                <Button
                  className={`h-auto p-0 text-neutral-700 !shadow-none focus-visible:border focus-visible:border-primary-200 ${payload.classNameButton}`}
                  disabled={payload.isDisabled}
                  variant={variant}
                  onClick={() => {
                    if (payload.callback) payload.callback(row);
                  }}
                >
                  {icon}
                </Button>
              </span>
            </TooltipContainer>
          ) : (
            <Button
              className={`h-auto p-0 text-neutral-700 !shadow-none focus-visible:border focus-visible:border-primary-200 ${payload.classNameButton}`}
              disabled={payload.isDisabled}
              variant={variant}
              onClick={() => {
                if (payload.callback) payload.callback(row);
              }}
            >
              {icon}
            </Button>
          )}
        </div>
      );
    },
    size: 100,
  };
}

export function commonColumn<T>({
  title,
  isSorted = true,
  accessorKey,
  headerClassName,
  cellClassName,
  accessorFn,
  dataCell,
  widthThreshold,
  size,
  rootFontSize,
}: {
  title: ReactNode;
  isSorted?: boolean;
  accessorKey: string;
  headerClassName?: string;
  cellClassName?: string;
  accessorFn?: (row: T) => string | number;
  dataCell?: (row: T) => string;
  widthThreshold?: number;
  size?: number;
  rootFontSize?: number;
}): ColumnDef<T> {
  return {
    header: withExtraProps(CommonHeader<T>, {
      isSorted,
      title,
      className: headerClassName,
    }),
    accessorKey,
    accessorFn: accessorFn ?? dataCell,
    cell: withExtraProps(CommonCell<T>, {
      className: cellClassName,
      accessorKey,
      dataCell,
      widthThreshold: widthThreshold,
      size: size ? Math.round(size) : undefined,
      rootFontSize,
    }),
    sortingFn: localeAlphanumericSort,
    size,
  };
}

export function statusColumn<T>({
  accessorKey = "status",
  title,
  isSorted = true,
  size,
  hasTranslation = false,
  cellClassName,
  headerClassName,
}: {
  accessorKey?: string;
  title?: string;
  isSorted?: boolean;
  size?: number;
  hasTranslation?: boolean;
  cellClassName?: string;
  headerClassName?: string;
}): ColumnDef<T> {
  return {
    header: withExtraProps(CommonHeader, {
      title,
      isSorted,
      className: headerClassName,
    }),
    accessorKey,
    cell: withExtraProps(StatusCell, {
      hasTranslation,
      accessorKey,
      cellClassName,
    }),
    size,
  };
}
