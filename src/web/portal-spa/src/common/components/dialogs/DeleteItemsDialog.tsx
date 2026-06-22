"use client";

import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import DataTable from "@common/components/containers/tables/DataTable";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { Textarea } from "@common/components/ui/textarea";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import toast from "@common/components/ui/toast";

import { ClearContent, Delete } from "@common/components/icons";

import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { type ReactNode, useState } from "react";
import type { FetchResult } from "@/api/types";
import { cn } from "@common/lib/core/utils";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

interface DeleteItemsDialogProps<T> {
  isOpen: boolean;
  toggleOpen: (isOpen: boolean) => void;
  handleClose?: () => void;
  handleSuccessDeletion?: () => void;
  requestDeleteItem: (
    id: string,
    payload?: Record<string, string>,
  ) => Promise<FetchResult<unknown>>;
  payload?: Record<string, string>;
  confirmationPrompt?: string;
  confirmationMessage?: ReactNode;
  icon?: ReactNode;
  hasDataTable?: boolean;
  data: {
    title: string;
    description: ReactNode;
    multipleTitle?: string;
    multipleDesc?: ReactNode;
    info?: {
      id: string;
      label: string;
      value: string;
      row?: number;
      className?: string;
      showCopyIcon?: boolean;
    }[];
    successMessage: ReactNode;
    confirmationBtnText: string;
    cancelText?: string;
    tableData: T[];
    selectedIds: string[];
    columns?: ColumnDef<T>[];
    warning?: ReactNode;
    hasDataTable?: boolean;
  };
  batchDelete?: (
    payload: Record<string, string>[],
  ) => Promise<FetchResult<unknown>>;
}

function DeleteItemsDialog<T>({
  isOpen,
  toggleOpen,
  handleClose,
  handleSuccessDeletion,
  requestDeleteItem,
  payload,
  confirmationPrompt,
  confirmationMessage,
  batchDelete,
  icon = <Delete size={18} />,
  hasDataTable = true,
  data,
}: Readonly<DeleteItemsDialogProps<T>>) {
  const t = useLayoutStore((state) => state.t);
  const router = useAppRouter();

  const [loadingDeleteItems, setLoadingDeleteItems] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationTextChanged, setConfirmationTextChanged] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const deleteConfirmationMessage = confirmationPrompt ?? "DELETE ALL";
  const hasSize = !data.columns?.find((col) => !col.size);

  const table = useReactTable({
    columns: data.columns ?? [],
    data: data.tableData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleDelete = async () => {
    if (!data.selectedIds.length || loadingDeleteItems) return;
    const fetchDeleteItems: Promise<FetchResult<unknown>>[] = [];

    if (batchDelete && data.selectedIds.length > 1) {
      fetchDeleteItems.push(
        batchDelete(data.selectedIds.map((item) => ({ id: item }))),
      );
    } else {
      data.selectedIds.forEach((item) => {
        fetchDeleteItems.push(
          payload ? requestDeleteItem(item, payload) : requestDeleteItem(item),
        );
      });
    }

    setLoadingDeleteItems(true);
    const response = await Promise.all(fetchDeleteItems);
    setLoadingDeleteItems(false);
    const errorRequest = response.filter((res) => !res.success);

    if (errorRequest.length) {
      errorRequest.forEach((res) => {
        if (!res.success) {
          toast.customError(res.error, res.status, res.statusText);
        }
      });
    }

    if (errorRequest.length === 0) {
      toast(data.successMessage);
    }

    if (errorRequest.length < response.length) {
      setConfirmationText("");
      setConfirmationTextChanged(false);
      toggleOpen(false);
      handleSuccessDeletion?.();
    }

    const shouldRefresh = response.some((res) => res.shouldRefresh);

    if (shouldRefresh) {
      router.refresh();
    }
  };

  return (
    <BaseDialogContainer
      cancelText={data.cancelText ?? t("common.delete_items.cancel")}
      isOpen={isOpen}
      title={data.tableData.length === 1 ? data.title : data.multipleTitle}
      className={
        data.tableData.length === 1 ? "min-w-[40.625rem]" : "min-w-[41.4375rem]"
      }
      okElement={
        <Button
          type="submit"
          disabled={
            (data.tableData.length !== 1 || !!confirmationPrompt) &&
            confirmationText !== deleteConfirmationMessage
          }
          leftIcon={icon}
          isLoading={loadingDeleteItems}
          onClick={() => {
            void handleDelete();
          }}
        >
          {data.confirmationBtnText}
        </Button>
      }
      onCancel={() => {
        toggleOpen(false);
      }}
      onOpen={(isOpen) => {
        toggleOpen(isOpen);
        setConfirmationText("");
        setConfirmationTextChanged(false);
        if (data.tableData.length === 1) {
          handleClose?.();
        }
      }}
    >
      {data.tableData.length === 1 ? (
        <div className="flex flex-col gap-3">
          {data.description && (
            <div className="break-all">{data.description}</div>
          )}
          {data.info?.map((item, index) => {
            return (
              <div key={`${item.value}-delete-${index}`}>
                <Label className="grid w-full items-center gap-1">
                  <span className="leading-5">{item.label}</span>
                  {(item.row ?? 1) === 1 ? (
                    <Input
                      showCopyIcon={item.showCopyIcon}
                      readOnly
                      className={cn(item.className)}
                      id={`deleteItem-${item.id}`}
                      value={item.value}
                    />
                  ) : (
                    <Textarea
                      showCopyIcon={item.showCopyIcon}
                      readOnly
                      className={cn(
                        "min-h-0 resize-none py-[0.375rem]",
                        item.className,
                      )}
                      id={`deleteItem-${item.id}`}
                      rows={item.row ?? 1}
                      value={item.value}
                    />
                  )}
                </Label>
              </div>
            );
          })}
          {data.hasDataTable && (
            <DataTable
              hasSize={hasSize}
              columns={data.columns ?? []}
              noResultsMessage={""}
              table={table}
              wrapperClassName="max-w-full"
            />
          )}
          {confirmationPrompt && (
            <div className="space-y-1">
              {confirmationMessage}
              <Input
                className={`focus-visible:ring-none ${
                  confirmationTextChanged &&
                  confirmationText !== deleteConfirmationMessage
                    ? "!border-red-800"
                    : ""
                }`}
                id="DeleteMultipleItemsDialog-confirmation"
                maxLength={50}
                value={confirmationText}
                onChange={(e) => {
                  if (!confirmationTextChanged) {
                    setConfirmationTextChanged(true);
                  }
                  setConfirmationText(e.target.value);
                }}
                rightIcon={
                  confirmationText && (
                    <TooltipContainer
                      isPreventDefault={false}
                      content={t("common.actions.delete")}
                      disableHoverableContent={true}
                    >
                      <button
                        className="block"
                        onClick={() => {
                          setConfirmationText("");
                        }}
                      >
                        <ClearContent />
                      </button>
                    </TooltipContainer>
                  )
                }
              />

              {confirmationTextChanged &&
                confirmationText !== deleteConfirmationMessage && (
                  <div className="mt-1 text-red-800">
                    {t("common.delete_items.enter_confirmation_text")}
                  </div>
                )}
              {data.warning}
            </div>
          )}
        </div>
      ) : (
        <div className="scrollbar flex flex-col gap-3 overflow-auto">
          {data.multipleDesc && <div>{data.multipleDesc}</div>}
          {hasDataTable && (
            <div>
              <DataTable
                hasSize={hasSize}
                columns={data.columns ?? []}
                noResultsMessage={""}
                table={table}
                wrapperClassName="max-h-[17.5rem] scrollbar max-w-full"
              />
            </div>
          )}
          {!!deleteConfirmationMessage && (
            <div className="space-y-1">
              <p>
                {t("common.delete_items.confirmation_message1")}
                <span className="font-bold">{deleteConfirmationMessage}</span>
                {t("common.delete_items.confirmation_message2")}
              </p>
              <Input
                className={`focus-visible:ring-none ${
                  confirmationTextChanged &&
                  confirmationText !== deleteConfirmationMessage
                    ? "!border-red-800"
                    : ""
                }`}
                id="DeleteMultipleItemsDialog-confirmation"
                maxLength={50}
                value={confirmationText}
                onChange={(e) => {
                  if (!confirmationTextChanged) {
                    setConfirmationTextChanged(true);
                  }
                  setConfirmationText(e.target.value);
                }}
                rightIcon={
                  confirmationText && (
                    <TooltipContainer
                      isPreventDefault={false}
                      content={t("common.actions.delete")}
                      disableHoverableContent={true}
                    >
                      <button
                        className="block"
                        onClick={() => {
                          setConfirmationText("");
                        }}
                      >
                        <ClearContent />
                      </button>
                    </TooltipContainer>
                  )
                }
              />
              {confirmationTextChanged &&
                confirmationText !== deleteConfirmationMessage && (
                  <div className="mt-1 text-red-800">
                    {t("common.delete_items.enter_confirmation_text")}
                  </div>
                )}
              {data.warning}
            </div>
          )}
        </div>
      )}
    </BaseDialogContainer>
  );
}

export default DeleteItemsDialog;
