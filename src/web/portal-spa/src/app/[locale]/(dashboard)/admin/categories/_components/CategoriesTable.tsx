"use client";

import {
  ChevronDown,
  Delete,
  Edit,
  Eye,
  Filter,
  More,
  Plus,
  Search,
} from "@common/components/icons";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import {
  bulkDeleteConnectedSystems,
  deleteConnectedSystem,
} from "@/app/[locale]/(dashboard)/admin/categories/_apis/actions";
import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddCategoryDrawer from "@/app/[locale]/(dashboard)/admin/categories/_components/AddCategoryDrawer";
import type { CategoryRow } from "@/app/[locale]/(dashboard)/admin/categories/_apis/types";
import { Checkbox } from "@common/components/ui/checkbox";
import ConfirmDeleteModal from "@common/components/dialogs/ConfirmModal";
import DataTable from "@common/components/containers/tables/DataTable";
import GCelander from "@common/components/calendar/GCelander";
import Image from "next/image";
import { PAGE_SIZES } from "@/app/[locale]/(dashboard)/admin/categories/_lib/const";
import TablePagination from "@common/components/containers/tables/TablePagination";
import ViewCategoryDrawer from "@/app/[locale]/(dashboard)/admin/categories/_components/ViewCategoryDrawer";
import { cn } from "@common/lib/core/utils";
import toast from "@common/components/ui/toast";
import { useTranslations } from "next-intl";

type Props = Readonly<{
  items: CategoryRow[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  softwareType: string;
  fromDate: string;
  toDate: string;
}>;

const STATUS_FILTERS = [
  { value: "", labelKey: "filter_all" },
  { value: "active", labelKey: "filter_active" },
  { value: "inactive", labelKey: "filter_inactive" },
] as const;

const SOFTWARE_TYPE_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "internal", label: "Phần mềm nội bộ" },
  { value: "external", label: "Phần mềm bên ngoài" },
] as const;

export default function CategoriesTable({
  items,
  total,
  page,
  pageSize,
  search,
  status,
  softwareType,
  fromDate,
  toDate,
}: Props) {
  const t = useTranslations("dashboard.admin.categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(
    null,
  );
  const [isDeleting, startDeleting] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteRow = useCallback((id: number) => {
    setConfirmDeleteIds([id]);
  }, []);

  const selectedIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, v]) => v)
        .map(([k]) => Number(k))
        .filter((n) => Number.isFinite(n)),
    [rowSelection],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    setConfirmDeleteIds(selectedIds);
  }, [selectedIds]);

  const handleConfirmDelete = useCallback(() => {
    const ids = confirmDeleteIds;
    if (!ids || ids.length === 0) return;
    const [firstId] = ids;
    if (firstId === undefined) return;
    startDeleting(async () => {
      const isBulk = ids.length > 1;
      const res = isBulk
        ? await bulkDeleteConnectedSystems(ids)
        : await deleteConnectedSystem(firstId);
      if (res.success) {
        toast.success("Xoá thành công");
        if (isBulk) setRowSelection({});
        setViewId(null);
        router.refresh();
      } else {
        toast.customError(res.error, res.status, res.statusText);
      }
      setConfirmDeleteIds(null);
    });
  }, [confirmDeleteIds, router]);

  const updateParams = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "") params.delete(k);
        else params.set(k, String(v));
      });
      const resetKeys = new Set([
        "search",
        "status",
        "softwareType",
        "fromDate",
        "toDate",
      ]);
      if (Object.keys(updates).some((k) => resetKeys.has(k))) {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: "select",
        size: 44,
        header: ({ table }) => (
          <div className="flex w-full justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => {
                table.toggleAllPageRowsSelected(!!v);
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex w-full justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => {
                row.toggleSelected(!!v);
              }}
            />
          </div>
        ),
      },
      {
        id: "no",
        size: 40,
        header: () => <span className="block text-center">#</span>,
        cell: ({ row }) => (
          <div className="flex w-full justify-center text-[14px] text-neutral-900 dark:text-neutral-dark-900">
            {(page - 1) * pageSize + row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        size: 340,
        header: () => t("col_name"),
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              onClick={() => {
                setViewId(row.original.id);
              }}
              className="cursor-pointer bg-transparent p-0 text-left text-[13px] font-medium text-blue-700 hover:underline dark:text-blue-500"
            >
              {row.original.name}
            </button>
            <div className="mt-1.5 flex items-center gap-1 text-[12px]">
              <span className="text-neutral-500 dark:text-neutral-dark-500">
                {t("code_prefix")}:
              </span>
              <span className="font-medium text-neutral-700 dark:text-neutral-dark-700">
                {row.original.softwareCode}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "softwareType",
        size: 140,
        header: () => "Loại phần mềm",
        cell: ({ row }) => {
          const type = row.original.softwareType;
          if (type !== "internal" && type !== "external") return null;
          const isInternal = type === "internal";
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-[6px] px-2 py-1 text-[12px] font-medium",
                isInternal
                  ? "bg-[#ede9fe] text-[#5b21b6]"
                  : "bg-[#e0eaff] text-[#1e3a8a]",
              )}
            >
              {isInternal ? "Nội bộ" : "Bên ngoài"}
            </span>
          );
        },
      },
      {
        accessorKey: "addresses",
        size: 220,
        header: () => t("col_address"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.addresses.map((addr) => (
              <span
                key={`${addr.type}-${addr.value}`}
                className="rounded-[4px] bg-[#f4f4f4] px-1 py-0.5 text-[10px] text-[#393b40] dark:bg-neutral-dark-100 dark:text-neutral-dark-700"
              >
                {addr.type}: {addr.value}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        size: 100,
        header: () => t("col_status"),
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center rounded-[4px] px-1.5 py-1 text-[11px] font-medium",
              row.original.status === "active"
                ? "bg-[#e1fce9] text-[#0b5c22]"
                : "bg-red-50 text-red-600",
            )}
          >
            {row.original.status === "active"
              ? t("status_active")
              : t("status_inactive")}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        size: 150,
        header: () => t("col_created_at"),
        cell: ({ row }) => (
          <span className="text-[14px] text-neutral-900 dark:text-neutral-dark-900">
            {row.original.createdAt}
          </span>
        ),
      },
      {
        id: "actions",
        size: 56,
        cell: ({ row }) => (
          <div className="flex w-full justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-[6px] bg-white p-1.5 hover:bg-neutral-50 dark:bg-neutral-dark-50 dark:hover:bg-neutral-dark-100">
                  <More
                    size={16}
                    className="text-neutral-500 dark:text-neutral-dark-500"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => {
                    setViewId(row.original.id);
                  }}
                >
                  <Eye size={15} className="text-neutral-500" />
                  {t("action_view")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => {
                    setEditId(row.original.id);
                  }}
                >
                  <Edit size={15} className="text-neutral-500" />
                  {t("action_edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600"
                  onClick={() => {
                    handleDeleteRow(row.original.id);
                  }}
                >
                  <Delete size={15} />
                  {t("action_delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, page, pageSize, handleDeleteRow],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    rowCount: total,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row, idx) => {
      const id = row.id as number | undefined;
      return id == null ? `idx-${idx}` : String(id);
    },
    state: { rowSelection },
  });

  const filterCount =
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0) +
    (status ? 1 : 0) +
    (softwareType ? 1 : 0);

  return (
    <>
      <AddCategoryDrawer
        open={openAdd || editId !== null}
        editId={editId}
        onOpenChange={(o) => {
          if (!o) {
            setOpenAdd(false);
            setEditId(null);
          }
        }}
      />
      <ViewCategoryDrawer
        open={viewId !== null}
        id={viewId}
        onOpenChange={(o) => {
          if (!o) setViewId(null);
        }}
        onEditClick={(id) => {
          setViewId(null);
          setEditId(id);
        }}
        onDelete={(id) => {
          setConfirmDeleteIds([id]);
        }}
      />
      <ConfirmDeleteModal
        open={confirmDeleteIds !== null}
        content={
          (confirmDeleteIds?.length ?? 0) > 1
            ? `Bạn chắc chắn muốn xóa ${confirmDeleteIds?.length} bản ghi đã chọn?`
            : "Bạn chắc chắn muốn xóa bản ghi này?"
        }
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmDeleteIds(null);
        }}
      />
      <div className="flex h-full flex-col gap-[40px]">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold leading-5 text-neutral-900 dark:text-neutral-dark-900">
            {t("title")}
          </h1>
          <button
            onClick={() => {
              setOpenAdd(true);
            }}
            className="flex h-[34px] items-center gap-1 rounded-[6px] bg-blue-700 px-3 text-[12px] font-medium text-white hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus size={16} />
            {t("add_new")}
          </button>
        </div>

        {/* Card */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-[#eee] bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.03)] dark:border-neutral-dark-100 dark:bg-neutral-dark-0">
          {/* Toolbar */}
          <div className="flex h-[66px] shrink-0 items-center gap-[10px] border-b border-[#eee] pl-4 pr-5 dark:border-neutral-dark-100">
            <div className="relative max-w-[420px] flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-dark-400"
              />
              <input
                defaultValue={search}
                onChange={(e) => {
                  updateParams({ search: e.target.value });
                }}
                placeholder={t("search_placeholder")}
                className="h-[30px] w-full rounded-[6px] border border-[#dcddde] bg-white pl-9 pr-3 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#bcbfc5] focus:border-blue-300 dark:border-neutral-dark-300 dark:bg-neutral-dark-0"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setShowFilters((v) => !v);
              }}
              className={cn(
                "flex h-[30px] shrink-0 items-center gap-1.5 rounded-[6px] border px-3 text-[13px] font-medium shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]",
                showFilters || filterCount > 0
                  ? "dark:bg-blue-900/20 border-blue-700 bg-blue-50 text-blue-700 dark:border-blue-700 dark:text-blue-500"
                  : "border-[#dcddde] bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:text-neutral-dark-700 dark:hover:bg-neutral-dark-50",
              )}
            >
              <Filter size={14} />
              Bộ lọc
              {filterCount > 0 && (
                <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white">
                  {filterCount}
                </span>
              )}
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="ml-auto flex h-[34px] items-center gap-1.5 rounded-[6px] bg-red-600 px-3 text-[13px] font-medium text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] hover:bg-red-700"
              >
                <Delete size={14} />
                {t("action_delete")} ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex shrink-0 items-center gap-3 border-b border-[#eee] bg-[#fafafa] px-4 py-3 dark:border-neutral-dark-100 dark:bg-neutral-dark-50">
              <GCelander
                size="small"
                style={{ width: 168, height: 30 }}
                value={fromDate}
                maxDate={toDate}
                placeholder={t("from_date")}
                onChange={(iso) => {
                  updateParams({ fromDate: iso });
                }}
              />
              <GCelander
                size="small"
                style={{ width: 168, height: 30 }}
                value={toDate}
                minDate={fromDate}
                placeholder={t("to_date")}
                onChange={(iso) => {
                  updateParams({ toDate: iso });
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-[30px] w-[168px] items-center justify-between rounded-[6px] border border-[#dcddde] bg-white px-3 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] hover:bg-neutral-50 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:hover:bg-neutral-dark-50"
                  >
                    <span
                      className={cn(
                        "text-[13px]",
                        status
                          ? "text-neutral-700 dark:text-neutral-dark-700"
                          : "text-[#bcbfc5]",
                      )}
                    >
                      {status
                        ? t(
                            (
                              STATUS_FILTERS.find((f) => f.value === status) ??
                              STATUS_FILTERS[0]
                            ).labelKey,
                          )
                        : "Trạng thái"}
                    </span>
                    <ChevronDown
                      size={14}
                      className="shrink-0 text-neutral-400 dark:text-neutral-dark-400"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[168px]">
                  {STATUS_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => {
                        updateParams({ status: f.value });
                      }}
                      className={cn(
                        "text-[13px]",
                        status === f.value &&
                          "bg-blue-50 font-medium text-blue-700",
                      )}
                    >
                      {t(f.labelKey)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-[30px] w-[168px] items-center justify-between rounded-[6px] border border-[#dcddde] bg-white px-3 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] hover:bg-neutral-50 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:hover:bg-neutral-dark-50"
                  >
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        softwareType
                          ? "text-neutral-700 dark:text-neutral-dark-700"
                          : "text-[#bcbfc5]",
                      )}
                    >
                      {softwareType
                        ? (
                            SOFTWARE_TYPE_FILTERS.find(
                              (f) => f.value === softwareType,
                            ) ?? SOFTWARE_TYPE_FILTERS[0]
                          ).label
                        : "Loại phần mềm"}
                    </span>
                    <ChevronDown
                      size={14}
                      className="shrink-0 text-neutral-400 dark:text-neutral-dark-400"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  {SOFTWARE_TYPE_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => {
                        updateParams({ softwareType: f.value });
                      }}
                      className={cn(
                        "text-[13px]",
                        softwareType === f.value &&
                          "bg-blue-50 font-medium text-blue-700",
                      )}
                    >
                      {f.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {filterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    updateParams({
                      fromDate: "",
                      toDate: "",
                      status: "",
                      softwareType: "",
                    });
                  }}
                  className="ml-auto text-[12px] font-medium text-blue-700 hover:underline"
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Table */}
          <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-[120px]">
                <Image
                  src="/image/dmPhanMemKetNoi/no_data_1.png"
                  alt="Không có dữ liệu"
                  width={158}
                  height={186}
                  className="select-none"
                  priority={false}
                />
              </div>
            ) : (
              <DataTable
                table={table}
                columns={columns}
                hasSize={false}
                wrapperClassName="h-full max-h-none max-w-full overflow-y-auto"
                headerRowClassName="h-10 bg-[#fafafa] hover:bg-[#fafafa] dark:bg-neutral-dark-50 dark:hover:bg-neutral-dark-50 [&_th]:text-[13px] [&_th]:font-normal [&_th]:text-neutral-500 [&_th]:border-r [&_th]:border-[#eee] [&_th:last-child]:border-r-0 dark:[&_th]:text-neutral-dark-500 dark:[&_th]:border-neutral-dark-100"
                bodyRowClassName="hover:bg-[#FBFBFB] dark:hover:bg-neutral-dark-50"
                cellClassName="p-0 border-r border-[#eee] last:border-r-0 dark:border-neutral-dark-100"
                cellInnerClassName="flex h-[60px] items-center overflow-hidden px-4"
              />
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#eee] px-4 py-3 dark:border-neutral-dark-100">
            <TablePagination
              table={table}
              currentIndex={page}
              currentSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageChange={(p) => {
                updateParams({ page: p });
              }}
              onPageSizeChange={(s) => {
                updateParams({ pageSize: s, page: 1 });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
