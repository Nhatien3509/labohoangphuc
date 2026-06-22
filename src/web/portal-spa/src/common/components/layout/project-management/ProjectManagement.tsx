"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  CommonCell,
  CommonHeader,
  rowNumberColumn,
} from "@common/components/containers/tables/CommonColumns";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import LeaveProjectDialog from "@common/components/dialogs/LeaveProjectDialog";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";

import { Leave, Plus, Settings } from "@common/components/icons";
import ManageProjectButton from "@common/components/layout/project-management/ManageProjectButton";
import ManegementTableDialog from "@common/components/layout/project-management/ManegementTableDialog";
import MaxProjectsWarningDialog from "@common/components/layout/project-management/MaxProjectsWarningDialog";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/api/common/types";

type BasicProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

const getProjectList = (_args?: Record<string, string | number>) =>
  Promise.resolve({
    success: true,
    status: 200,
    data: { results: [] as Project[], count: 0 },
  } as const);
type StubMember = { id: string; role: string; username?: string };
const getMemberList = (
  _args: Record<string, string>,
  _headers?: Record<string, string>,
) => Promise.resolve({ data: { results: [] as StubMember[] } });
import { ROUTES } from "@common/lib/core/routes";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { usePathname } from "next/navigation";
import { useResponsiveColumns } from "@common/hooks/useResponsiveColumns";
import { withExtraProps } from "@common/components/containers/Hoc";

const hiddenProjectManagement = ["billing", "iam"];

export default function ProjectManagement({
  triggerClassName,
}: Readonly<{
  triggerClassName?: string;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, executeAction } = useActionAPI();
  const [isLeaveProjectOpen, setIsLeaveProjectOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const pathName = usePathname();
  const modules = pathName.split("/")[2] ?? "";

  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Project[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [projectInfo, setProjectInfo] = useState<BasicProject | null>(null);
  const prevSearchValue = useRef(searchValue);

  const {
    currentUser,
    currentProject,
    updateCurrentProject,
    updateCurrentMember,
    updateLayoutDialogState,
    t,
  } = useLayoutStore((state) => state);

  const isOverThousandRows = currentPage >= 200;
  const {
    elementRef: dataTableRef,
    columnsWidth: [rowNumberSize],
    autoScaledColumnWidth: columnWidth,
    rootFontSize,
  } = useResponsiveColumns({
    defaultTableWidth: 618,
    fixedColumnsWidth: 100,
    isOverThousandRows,
    defaultColumnWidths: isOverThousandRows ? [459] : [466],
    defaultNumberOfColumns: 2,
  });

  const columns: ColumnDef<Project>[] = useMemo(
    () => [
      rowNumberColumn<Project>({
        page: currentPage,
        pageSize: 5,
        title: t("project_management.row_number"),
        accessorKey: "id",
        size: rowNumberSize,
      }),
      {
        header: withExtraProps(CommonHeader, {
          title: t("project_management.project"),
          isSorted: true,
        }),
        accessorKey: "name",
        cell: withExtraProps(NameCell, {
          setIsOpen,
          size: columnWidth,
          rootFontSize,
        }),
        size: columnWidth,
      },
      {
        header: withExtraProps(CommonHeader, {
          title: t("project_management.id"),
          className: "w-full text-center h-auto",
          isSorted: true,
        }),
        accessorKey: "slug",
        cell: withExtraProps(CommonCell<Project>, {
          size: columnWidth,
          accessorKey: "slug",
        }),
        size: columnWidth,
      },

      {
        id: "actions",
        header: withExtraProps(CommonHeader, {
          title: t("project_management.actions"),
          className: "w-full text-center",
        }),
        enableHiding: false,
        cell: withExtraProps(ActionsCell, {
          setProjectInfo,
          toggleLeaveProject: setIsLeaveProjectOpen,
          t,
          setIsOpen,
        }),
        size: 100,
      },
    ],
    [currentPage, columnWidth],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const fetchProjectList = async (args?: Record<string, string | number>) => {
    const pageSize = 5;
    const res = await executeAction(getProjectList, {
      pageSize,
      ...args,
    });

    if (!res?.success) return [];

    const results = res.data?.results ?? [];
    table.setOptions((pre) => ({
      ...pre,
      pageCount: Math.ceil((res.data?.count ?? 1) / pageSize),
      rowCount: res.data?.count,
    }));
    setData(results);
    return results;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (prevSearchValue.current !== searchValue) {
      prevSearchValue.current = searchValue;
      setCurrentPage(1);
      fetchProjectList({ q: searchValue, page: 1 }).catch(console.error);
      return;
    }

    fetchProjectList({ q: searchValue, page: currentPage }).catch(
      console.error,
    );
  }, [currentPage, searchValue, isOpen]);

  const onLeaveProjectSuccess = async (projectId: string) => {
    const projectList = await fetchProjectList();
    if (projectList.length === 0) setIsOpen(false);
    const currentProjectId = currentProject?.id;
    if (currentProjectId !== projectId) {
      return;
    }

    const nextProjectId = projectList[0]?.id ?? "";
    const members = (
      await getMemberList(
        {
          user: currentUser?.username ?? "",
        },
        { "project-id": nextProjectId },
      )
    ).data.results;
    const currentMember =
      currentUser && members.length > 0 ? members[0] : undefined;
    updateCurrentMember(currentMember);
    await updateCurrentProject(projectList[0]);
  };

  const handleCreateProject = () => {
    if (currentUser?.remainingProjects === 0) {
      setIsOpen(false);
      setIsWarningOpen(true);
      return;
    }
    updateLayoutDialogState({
      create_project: {
        isOpen: true,
        onSuccess: () => {
          void fetchProjectList();
        },
      },
    });
  };

  return (
    <>
      {!hiddenProjectManagement.includes(modules) && (
        <ManageProjectButton
          triggerClassName={triggerClassName}
          {...(currentProject && {
            setIsOpenMangementDialog: setIsOpen,
          })}
        />
      )}
      <BaseDialogContainer
        isOpen={isOpen}
        onOpen={setIsOpen}
        cancelText={t("project_management.close")}
        title={t("project_management.title")}
        okElement={
          <Button onClick={handleCreateProject} leftIcon={<Plus />}>
            {t("common.create_project.create_new")}
          </Button>
        }
      >
        <ManegementTableDialog
          {...{
            searchValue,
            setSearchValue,
            isLoading,
            columns,
            table,
            currentPage,
            setCurrentPage,
            fetchProjectList,
            dataTableRef,
          }}
        />
      </BaseDialogContainer>
      <LeaveProjectDialog
        isOpen={isLeaveProjectOpen}
        project={projectInfo}
        toggleOpen={setIsLeaveProjectOpen}
        onSuccess={(projectId) => void onLeaveProjectSuccess(projectId)}
      />
      <MaxProjectsWarningDialog
        {...{ isWarningOpen, setIsWarningOpen }}
        limit={table.getRowCount()}
      />
    </>
  );
}

function NameCell({
  row,
  setIsOpen,
  size,
  rootFontSize,
}: Readonly<{
  row: Row<Project>;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  size: number;
  rootFontSize: number;
}>) {
  const { updateCurrentProject } = useLayoutStore((state) => state);
  const cellPaddingYByRem = 1.5;
  const maxWidth =
    size && rootFontSize ? size / rootFontSize - cellPaddingYByRem : undefined;

  return (
    <Button
      className="h-auto w-[12.9375rem] justify-start p-0 focus-visible:border focus-visible:border-primary-200 focus-visible:shadow-none"
      variant="text"
      onClick={() => {
        updateCurrentProject(row.original)
          .then(() => {
            setIsOpen(false);
          })
          .catch(console.error);
      }}
    >
      <TooltipText
        className="w-fit text-left base-transition hover:font-semibold hover:underline"
        content={row.getValue("name")}
        maxWidth={maxWidth}
      />
    </Button>
  );
}

function ActionsCell({
  row,
  setProjectInfo,
  toggleLeaveProject,
  setIsOpen,
  t,
}: Readonly<{
  row: Row<Project>;
  setProjectInfo: (value: React.SetStateAction<BasicProject | null>) => void;
  toggleLeaveProject: (value: React.SetStateAction<boolean>) => void;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  t: (key: string) => string;
}>) {
  const { updateCurrentProject } = useLayoutStore((state) => state);
  const { getValue } = row;
  const data: BasicProject = {
    id: getValue("id"),
    name: getValue("name"),
    slug: getValue("slug"),
    description: "",
  };
  const router = useAppRouter();

  return (
    <div className="flex items-center justify-center gap-3">
      <TooltipContainer content={t("sidebar.project.management")}>
        <Button variant={"icon"} className="focus-visible:border-primary-200">
          <Settings
            className="cursor-pointer hover:text-primary-200"
            onClick={() => {
              updateCurrentProject(row.original)
                .then(() => {
                  setIsOpen(false);
                  router.push(ROUTES.project.overview(row.original.id));
                })
                .catch(console.error);
            }}
          />
        </Button>
      </TooltipContainer>
      <TooltipContainer content={t("common.leave_project.title")}>
        <Button variant={"icon"} className="focus-visible:border-primary-200">
          <Leave
            className="cursor-pointer text-inherit hover:text-primary-200"
            onClick={() => {
              setProjectInfo(data);
              toggleLeaveProject(true);
            }}
          />
        </Button>
      </TooltipContainer>
    </div>
  );
}
