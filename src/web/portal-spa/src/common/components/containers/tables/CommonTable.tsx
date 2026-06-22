import DataTable from "@common/components/containers/tables/DataTable";
import DebounceInput from "@common/components/containers/inputs/DebounceInput";
import SearchTypeSelect from "@common/components/containers/tables/SearchTypeSelect";
import SelectContainer from "@common/components/containers/selects/SelectContainer";
import TablePagination from "@common/components/containers/tables/TablePagination";

import ActionsDialog from "@common/components/dialogs/ActionsDialog";
import DeleteItemsDialog from "@common/components/dialogs/DeleteItemsDialog";
import { Loading } from "@common/components/icons";

import {
  type ColumnDef,
  type Row,
  type SortingState,
  type TableOptions,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FetchResult, GETResponse } from "@/api/types";
import React, { type ReactNode, useMemo, useRef, useState } from "react";
import { type DefaultParams } from "@common/lib/helpers/params";
import type { OptionType } from "@common/lib/core/types";
import { cn } from "@common/lib/core/utils";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useQueryParams } from "@common/hooks/useQueryParams";
import { useRowSelection } from "@common/hooks/useRowSelection";

export type SearchTypeConfig<TSearch> = {
  getData: (
    query?: DefaultParams,
  ) => Promise<FetchResult<GETResponse<TSearch>>>;
  queryParam?: string;
  extendsQuery?: DefaultParams;
  labelKey?: keyof TSearch;
  valueKey?: keyof TSearch;
  customItemLabel?: (option: TSearch) => string;
  customItemValue?: (option: TSearch) => string;
};

type CommonTableProps<T, TSearch = unknown> = {
  hasSize?: boolean;
  tableWrapperRef?: React.Ref<HTMLDivElement>;
  wrapperClassName?: string;
  hasRightShadow?: boolean;
  hasLeftShadow?: boolean;
  tableTitle?: string;
  currentPage?: string;
  className?: string;
  page: number;
  pageSize: number;
  searchOptions?: OptionType[];
  searchTypes?:
    | Record<string, OptionType[]>
    | Record<string, SearchTypeConfig<TSearch>>;
  filterBy?: string;
  searchValue: string;
  defaultSearchField?: string;
  searchPlaceholderOptions?: Record<string, string>;
  pageData: T[];
  totalPageCount: number;
  getColumns: (
    page: number,
    pageSize: number,
    setRowSelection: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >,
    setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setToBeDeleted: React.Dispatch<React.SetStateAction<T | undefined>>,
  ) => ColumnDef<T>[];
  getDeletionColumns?: (selectedRecord?: T[]) => ColumnDef<T>[];
  table?: Omit<TableOptions<T>, "data" | "columns" | "getCoreRowModel">;
  noResultsMessage?: string;
  actionMessage?: string;
  isActionsDialogOpen?: boolean;
  actionIcon?: ReactNode;
  handleDeleteActionsDialog?: () => void;
  requestDeleteItem?: (
    id: string,
    payload?: Record<string, string>,
  ) => Promise<FetchResult<unknown>>;
  batchDelete?: (
    payload: Record<string, string>[],
  ) => Promise<FetchResult<unknown>>;
  getDeleteItemsDialogData?: (
    selectedRecord: T[],
    toBeDeleted?: T,
  ) => {
    title: string;
    description: ReactNode;
    multipleTitle: string;
    multipleDesc: ReactNode;
    info?: {
      label: string;
      id: string;
      value: string;
      row?: number;
    }[];
    successMessage: ReactNode;
    confirmationBtnText: string;
    confirmationPrompt?: string;
    confirmationMessage?: ReactNode;
    hasDataTable?: boolean;
    payload?: Record<string, string>;
    icon?: ReactNode;
  };
  handleSearchOptionChange?: (option: OptionType) => void;
  handleSearchChange: (value: string | number) => void;
  onDeleteSuccess?: (currentSelected: T[]) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  toBeDeleted?: T;
  setToBeDeleted?: React.Dispatch<React.SetStateAction<T | undefined>>;
  currentSelected?: T[];
  actionsBtn?: ReactNode;
  searchMaxLength?: number;
  paginationClassName?: string;
  isPending?: boolean;
  renderExpandedRow?: (row: Row<T>) => ReactNode;
};

type ServerCommonTableProps<
  T,
  TSearch = unknown,
  K extends {
    filterBy?: string;
    searchValue?: string;
    page: number;
    pageSize: number;
    tab?: string;
    [key: string]: string | number | undefined;
  } = { page: 1; pageSize: 10 },
> = Omit<
  CommonTableProps<T, TSearch>,
  | "page"
  | "pageSize"
  | "filterBy"
  | "searchValue"
  | "handleSearchOptionChange"
  | "handleSearchChange"
  | "onPageChange"
  | "onPageSizeChange"
  | "isPending"
> & {
  validateSearchValue?: (searchBy: string, value: string) => boolean;
  getParams?: () => K;
  updateParams?: (
    newParams: Partial<
      Record<string | number, string | string[] | number | null>
    >,
  ) => void;
  refreshDataOnAction?: boolean;
};

function CommonTable<T extends { id: string }, TSearch = unknown>({
  hasSize = true,
  tableWrapperRef,
  hasRightShadow,
  hasLeftShadow,
  wrapperClassName,
  currentPage,
  className,
  page,
  pageSize,
  searchOptions,
  searchTypes,
  filterBy,
  searchValue,
  defaultSearchField,
  searchPlaceholderOptions,
  pageData,
  totalPageCount,
  getColumns,
  getDeletionColumns,
  table,
  noResultsMessage,
  actionMessage,
  isActionsDialogOpen = true,
  actionIcon,
  handleDeleteActionsDialog,
  requestDeleteItem,
  getDeleteItemsDialogData,
  handleSearchOptionChange,
  handleSearchChange,
  onDeleteSuccess,
  onPageChange,
  onPageSizeChange,
  batchDelete,
  actionsBtn,
  tableTitle,
  searchMaxLength = 255,
  paginationClassName,
  isPending,
  renderExpandedRow,
  ...props
}: Readonly<CommonTableProps<T, TSearch>>) {
  const [rowSelectionInternal, setRowSelectionInternal] = useState<
    Record<string, boolean>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toBeDeletedInternal, setToBeDeletedInternal] = useState<T>();
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const { isNavigating, isRefreshing } = useLayoutStore((state) => ({
    isNavigating: state.isNavigating,
    isRefreshing: state.isRefreshing,
  }));
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { currentSelected: currentSelectedInternal } = useRowSelection<T>(
    rowSelectionInternal,
    pageData,
  );

  const rowSelection = props.rowSelection ?? rowSelectionInternal;
  const setRowSelection = props.setRowSelection ?? setRowSelectionInternal;
  const toBeDeleted = props.toBeDeleted ?? toBeDeletedInternal;
  const setToBeDeleted = props.setToBeDeleted ?? setToBeDeletedInternal;
  const currentSelected = props.currentSelected ?? currentSelectedInternal;

  const searchBy =
    searchOptions?.find((option) => filterBy === option.value) ??
    searchOptions?.[0];
  const defaultPlaceholder = defaultSearchField ?? searchBy?.value ?? "";
  const key = searchBy?.value ?? defaultSearchField;
  const isSearchBySelect = key ? searchTypes?.[key] : undefined;

  const deleteItemsDialogData = getDeleteItemsDialogData?.(
    currentSelected,
    toBeDeleted,
  );

  const columns: ColumnDef<T>[] = useMemo(
    () =>
      getColumns(
        page,
        pageSize,
        setRowSelection,
        setIsDeleteDialogOpen,
        setToBeDeleted,
      ),
    [getColumns, page, pageSize, setRowSelection, setToBeDeleted],
  );

  const tableData = useReactTable({
    data: pageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSortingState,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
    pageCount: Math.ceil(totalPageCount / pageSize),
    rowCount: totalPageCount,
    enableRowSelection: true,
    ...table,
    state: {
      sorting: sortingState,
      rowSelection,
      ...table?.state,
    },
  });
  const deletionColumns = useMemo(
    () => getDeletionColumns?.(currentSelected),
    [currentSelected, getDeletionColumns],
  );

  const resetSelected = () => {
    setRowSelection({});
    setToBeDeleted(undefined);
  };

  const handleDeletion =
    handleDeleteActionsDialog ??
    (() => {
      setIsDeleteDialogOpen(true);
      setToBeDeleted(
        currentSelected.length === 1 ? currentSelected[0] : undefined,
      );
    });

  const handleSuccessDeletion = () => {
    resetSelected();
    onDeleteSuccess?.(currentSelected);
  };

  const handleDeleteItem = () =>
    Promise.resolve({ data: null } as FetchResult<unknown>);

  return (
    <div
      className={cn(`flex flex-col gap-3`, {
        "pointer-events-none relative": isNavigating || isRefreshing,
      })}
    >
      {isRefreshing && (
        <>
          <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <Loading size={74} className="animate-spin text-primary-200" />
          </div>
          <div className="absolute inset-0 z-10 animate-pulse rounded-lg bg-secondary opacity-5" />
        </>
      )}
      {tableTitle && <div className="font-semibold">{tableTitle}</div>}
      {(searchOptions ?? defaultSearchField) && (
        <div className="flex justify-between max-lg:block max-lg:space-y-3">
          <div className="flex">
            {!defaultSearchField && (
              <SelectContainer
                hasLeftBorderRadius
                className={cn("w-[11.25rem] max-sm:w-32", {
                  "max-sm:w-20": isSearchInputFocused,
                })}
                defaultValue={searchOptions?.[0]}
                id={`table-select-type-search-${currentPage}`}
                options={searchOptions}
                value={searchBy}
                onChange={(val) => {
                  handleSearchOptionChange?.(val as OptionType);
                }}
              />
            )}

            <div
              className={
                defaultSearchField
                  ? "w-[46.5rem] max-xl:w-[31.25rem]"
                  : "w-[36rem] max-xl:w-[28.75rem]"
              }
            >
              {isSearchBySelect ? (
                <SearchTypeSelect
                  defaultSearchField={defaultSearchField}
                  defaultPlaceholder={defaultPlaceholder}
                  handleSearchChange={handleSearchChange}
                  searchMaxLength={searchMaxLength}
                  searchType={isSearchBySelect}
                  searchValue={searchValue}
                  currentPage={currentPage}
                  searchPlaceholderOptions={searchPlaceholderOptions}
                />
              ) : (
                <DebounceInput
                  ref={searchRef}
                  showClearIcon
                  showSearchIcon
                  className={cn("pr-14", {
                    "rounded-none rounded-br rounded-tr border-l-0":
                      !defaultSearchField,
                  })}
                  id={`table-input-search-${currentPage}`}
                  maxLength={searchMaxLength}
                  placeholder={searchPlaceholderOptions?.[defaultPlaceholder]}
                  value={searchValue.trim()}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsSearchInputFocused(true);
                  }}
                  onBlur={() => {
                    setIsSearchInputFocused(false);
                  }}
                />
              )}
            </div>
          </div>

          {actionsBtn}
        </div>
      )}
      <div>
        <DataTable
          hasRightShadow={hasRightShadow}
          hasLeftShadow={hasLeftShadow}
          tableWrapperRef={tableWrapperRef}
          hasSize={hasSize}
          columns={columns}
          noResultsMessage={noResultsMessage}
          table={tableData}
          wrapperClassName={cn(
            "max-h-[31.75rem] scrollbar max-w-[calc(100vw-24rem)]",
            wrapperClassName,
          )}
          isLoading={isPending}
          renderExpandedRow={renderExpandedRow}
        />

        <TablePagination
          wrapperClassName={paginationClassName}
          currentIndex={page}
          currentSize={pageSize}
          table={tableData}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
      {isActionsDialogOpen && (
        <ActionsDialog
          actionMessage={actionMessage}
          handleClose={resetSelected}
          handleDelete={handleDeletion}
          icon={actionIcon}
          selected={toBeDeleted ? 1 : currentSelected.length}
        />
      )}
      <DeleteItemsDialog<T>
        handleClose={resetSelected}
        handleSuccessDeletion={handleSuccessDeletion}
        hasDataTable={deleteItemsDialogData?.hasDataTable}
        isOpen={isDeleteDialogOpen}
        requestDeleteItem={requestDeleteItem ?? handleDeleteItem}
        batchDelete={batchDelete}
        toggleOpen={setIsDeleteDialogOpen}
        confirmationPrompt={deleteItemsDialogData?.confirmationPrompt}
        confirmationMessage={deleteItemsDialogData?.confirmationMessage}
        icon={deleteItemsDialogData?.icon}
        data={{
          title: "",
          description: "",
          successMessage: "",
          confirmationBtnText: "",
          ...deleteItemsDialogData,
          tableData: toBeDeleted ? [toBeDeleted] : currentSelected,
          selectedIds: toBeDeleted
            ? [toBeDeleted.id]
            : currentSelected.map((item) => item.id),
          columns: deletionColumns,
        }}
        payload={deleteItemsDialogData?.payload}
      />
    </div>
  );
}

function ServerCommonTable<
  T extends { id: string },
  TSearch = unknown,
  K extends {
    filterBy?: string;
    searchValue?: string;
    page: number;
    pageSize: number;
    tab?: string;
    [key: string]: string | number | undefined;
  } = {
    page: number;
    pageSize: number;
  },
>({
  searchOptions,
  defaultSearchField,
  totalPageCount,
  validateSearchValue,
  refreshDataOnAction,
  ...props
}: Readonly<ServerCommonTableProps<T, TSearch, K>>) {
  const router = useAppRouter();
  const {
    getParams: internalGetParams,
    updateParams: internalUpdateParams,
    isPending,
  } = useQueryParams({
    [defaultSearchField ?? ""]: "",
    filterBy: "",
    searchValue: "",
    page: 1,
    pageSize: 10,
  });

  const getParams = props.getParams ?? internalGetParams;
  const updateParams = props.updateParams ?? internalUpdateParams;

  const {
    filterBy,
    page,
    pageSize,
    searchValue,
    [defaultSearchField ?? ""]: defaultSearchFieldValue,
  } = getParams();

  const searchBy =
    searchOptions?.find((option) => filterBy === option.value) ??
    searchOptions?.[0];

  const handleSearchOptionChange = (option: OptionType) => {
    updateParams({
      page: 1,
      filterBy: option.value,
      searchValue: "",
    });
  };

  const handleSearchChange = (value: string | number) => {
    const defaultSearchValue = defaultSearchField
      ? getParams()[defaultSearchField]
      : searchValue;

    if (value === defaultSearchValue) return;

    const validateSearch =
      validateSearchValue?.(
        defaultSearchField ?? searchBy?.value ?? "",
        value.toString(),
      ) ?? true;

    if (!validateSearch) return;

    updateParams(
      defaultSearchField
        ? {
            page: 1,
            [defaultSearchField]: value,
          }
        : {
            page: 1,
            searchValue: value,
            filterBy: searchBy?.value ?? "",
          },
    );

    if (refreshDataOnAction) router.refresh();
  };

  const onDeleteSuccess = (currentSelected: T[]) => {
    props.onDeleteSuccess?.(currentSelected);
    const totalItems = totalPageCount - currentSelected.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (page > totalPages) {
      updateParams({
        page: 1,
      });
    }
  };

  const onPageChange = (page: number) => {
    updateParams({
      page,
    });

    if (refreshDataOnAction) router.refresh();
  };

  const onPageSizeChange = (pageSize: number) => {
    updateParams({
      page: 1,
      pageSize,
    });

    if (refreshDataOnAction) router.refresh();
  };

  return (
    <CommonTable
      {...{
        page,
        pageSize,
        searchOptions,
        filterBy,
        searchValue: defaultSearchField
          ? (defaultSearchFieldValue ?? "").toString()
          : (searchValue ?? ""),
        defaultSearchField,
        totalPageCount,
        handleSearchOptionChange,
        handleSearchChange,
        onDeleteSuccess,
        onPageChange,
        onPageSizeChange,
        isPending,
        ...props,
      }}
    />
  );
}

export { CommonTable, ServerCommonTable };
