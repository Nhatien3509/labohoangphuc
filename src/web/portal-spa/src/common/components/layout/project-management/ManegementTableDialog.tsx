import DataTable from "@common/components/containers/tables/DataTable";
import DebounceInput from "@common/components/containers/inputs/DebounceInput";
import TablePagination from "@common/components/containers/tables/TablePagination";

import type { ColumnDef, Table } from "@tanstack/react-table";
import type { Project } from "@/api/common/types";
import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type ManegementTableDialogProps = {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  columns: ColumnDef<Project>[];
  table: Table<Project>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  dataTableRef?: React.Ref<HTMLDivElement>;
};

const ManegementTableDialog = ({
  searchValue,
  setSearchValue,
  isLoading,
  columns,
  table,
  currentPage,
  setCurrentPage,
  dataTableRef,
}: ManegementTableDialogProps) => {
  const { t } = useLayoutStore((state) => state);

  return (
    <div className="grid w-full gap-3">
      <div className="flex w-full items-center">
        <div className="relative w-full">
          <DebounceInput
            showClearIcon
            showSearchIcon
            className="focus-visible:ring-none relative h-9 w-full"
            id="search"
            placeholder={t("project_management.search")}
            value={searchValue}
            onChange={(value) => {
              setSearchValue(String(value));
            }}
          />
        </div>
      </div>

      <DataTable
        tableWrapperRef={dataTableRef}
        columns={columns}
        table={table}
        isLoading={isLoading}
      />

      <TablePagination
        showPageSize={false}
        isPaginationColumn
        currentIndex={currentPage}
        table={table}
        wrapperClassName={"mt-0 lead"}
        onPageChange={(page: number) => {
          setCurrentPage(page);
        }}
      />
    </div>
  );
};

export default ManegementTableDialog;
