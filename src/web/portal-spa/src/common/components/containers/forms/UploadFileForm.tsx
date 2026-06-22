import { FormDescription, FormField } from "@common/components/ui/form";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import { DivWrapper } from "@common/components/containers/DivWrapper";
import I18nCustomTag from "@common/components/containers/I18nCustomTag";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import TooltipText from "@common/components/containers/TooltipText";
import toast from "@common/components/ui/toast";

import {
  Cancel,
  Check,
  Delete,
  Retry,
  UploadFile,
} from "@common/components/icons";

import {
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type ReactNode,
  type SetStateAction,
  useState,
} from "react";
import {
  type FileJob,
  type UploadItem,
  type UploadStatus,
  useUploadStore,
} from "@common/components/layout/providers/uploadStore";
import { MAX_FILE_BYTES } from "@common/lib/core/const";
import { cn } from "@common/lib/core/utils";
// Inlined from deleted object-storage/_utils/utils
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] ?? ""}`;
};
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

interface UploadFileProps {
  isSubmitted: boolean;
  multiple?: boolean;
  name: string;
  desc?: ReactNode;
  currentPath?: string;
  uploadItemsStatus: Record<string, UploadItem>;
  cancelFile: (id: string) => Promise<void>;
  retryFile: (id: string) => Promise<void>;
}

export function UploadFileForm({
  isSubmitted,
  multiple = false,
  name,
  desc,
  uploadItemsStatus,
  cancelFile,
  retryFile,
  currentPath,
}: Readonly<UploadFileProps>) {
  const t = useTranslations();
  const { control, setValue } = useFormContext();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileJob[]>([]);
  const [isOpenCancelFile, setIsOpenCancelFile] = useState(false);
  const [fileToCancel, setFileToCancel] = useState<UploadItem>();
  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of fileArray) {
      if (f.size <= MAX_FILE_BYTES) accepted.push(f);
      else rejected.push(f);
    }
    rejected.forEach((file) => {
      toast.info(
        t.rich("common.validators.over_size_file", {
          name: file.name,
          bold: I18nCustomTag(),
        }),
      );
    });
    if (accepted.length === 0) return;

    const fileArrayMap: FileJob[] = accepted.map((file, idx) => ({
      uid: idx.toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      key: currentPath ? `${currentPath}${file.name}` : file.name,
      file,
    }));
    const singleFile = fileArrayMap[0] ? [fileArrayMap[0]] : [];
    const updatedFiles = multiple ? [...files, ...fileArrayMap] : singleFile;

    setFiles(updatedFiles);
    setValue(name, updatedFiles, { shouldValidate: true });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };
  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setValue(name, updatedFiles);
  };

  const handleCancel = () => {
    if (!fileToCancel || !uploadItemsStatus[fileToCancel.id]) return;

    const cancelItem = uploadItemsStatus[fileToCancel.id];

    if (cancelItem?.status !== "uploading") {
      toast.info(t("buckets.files.multiparts.cancel.upload_already_completed"));

      return;
    }

    cancelFile(cancelItem.id)
      .then(() => {
        toast(t("buckets.files.multiparts.cancel.successfully"));
      })
      .catch(console.error);
  };

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={() =>
          isSubmitted ? (
            <div className="w-full rounded-md border border-neutral-100">
              <div className="grid w-full grid-cols-[1fr_1fr_7.5rem] items-center border-b border-neutral-100 bg-neutral-50">
                <div className="p-4">
                  {t("buckets.files.upload_file_to_bucket.process.name")}
                </div>
                <div className="p-4">
                  {t("buckets.files.upload_file_to_bucket.process.title")}
                </div>
                <div className="m-auto p-4">{t("common.actions")}</div>
              </div>
              {Object.entries(uploadItemsStatus).map(([_id, file]) => {
                return (
                  <div
                    key={file.id}
                    className="grid w-full grid-cols-[1fr_1fr_7.5rem] items-center border-b border-neutral-100"
                  >
                    <div className="px-4 py-3">
                      <TooltipText content={file.name} maxWidth={14.5} />
                    </div>
                    <div className="px-4 py-3">
                      <GetFileState file={file} />
                    </div>
                    <div className="m-auto flex gap-4 px-4">
                      <GetFileActions
                        file={file}
                        setIsOpenCancelFile={setIsOpenCancelFile}
                        setFileToCancel={setFileToCancel}
                        retryFile={retryFile}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {desc && (
                <FormDescription className="text-base text-neutral-800">
                  {desc}
                </FormDescription>
              )}
              <DivWrapper
                className={cn(
                  `flex h-[6.5rem] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-0 transition-colors hover:bg-gray-100`,
                  { "bg-gray-50": isDragging },
                  {
                    "!border-red-800": control.getFieldState(name).error,
                  },
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  multiple={multiple}
                  className="hidden"
                  onChange={handleFileInput}
                />
                <UploadFile className="text-neutral-300" />
                <p className="text-center text-base font-medium text-neutral-600">
                  {t("buckets.files.upload_file_to_bucket.drag_and_drop_files")}
                </p>
              </DivWrapper>
              {files.length > 0 && (
                <div className="mt-3">
                  <ul className="space-y-1">
                    {files.map((file, idx) => (
                      <li
                        key={crypto.randomUUID()}
                        className="flex h-11 items-center justify-between border-b border-neutral-100 text-sm text-gray-700"
                      >
                        <div className="flex flex-col">
                          <TooltipText content={file.name} maxWidth={39.5} />
                          <span className="text-xs text-gray-500">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                        <TooltipContainer
                          content={t("common.buttons.delete")}
                          side="bottom"
                        >
                          <Button
                            variant={"icon"}
                            className=""
                            onClick={() => {
                              handleRemoveFile(idx);
                            }}
                            leftIcon={<Delete size={20} />}
                          ></Button>
                        </TooltipContainer>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        }
      />
      <CancelUploadDialog
        toggleOpen={setIsOpenCancelFile}
        isOpen={isOpenCancelFile}
        handleCancel={handleCancel}
        fileToCancel={fileToCancel}
      />
    </>
  );
}

export const GetFileState = ({
  file,
  showProgress = false,
}: {
  file: UploadItem;
  showProgress?: boolean;
}) => {
  const t = useTranslations();
  const fileState: Record<UploadStatus, string> = {
    done: t("buckets.files.upload_file_to_bucket.process.success"),
    error: t("buckets.files.upload_file_to_bucket.process.error"),
    uploading: showProgress
      ? `${file.percent}% (${formatBytes(file.uploadedBytes ?? 0)} / ${formatBytes(file.size)})`
      : `${file.percent}%`,
    queued: t("buckets.files.upload_file_to_bucket.process.queued"),
    canceled: t("buckets.files.upload_file_to_bucket.process.canceled"),
  };

  return fileState[file.status];
};

export const GetFileActions = ({
  file,
  setIsOpenCancelFile,
  setFileToCancel,
  retryFile,
  isMultipartView = false,
  setIsCancelAll,
}: {
  file: UploadItem;
  setIsOpenCancelFile: Dispatch<SetStateAction<boolean>>;
  setFileToCancel: Dispatch<SetStateAction<UploadItem | undefined>>;
  retryFile: (id: string) => Promise<void>;
  isMultipartView?: boolean;
  setIsCancelAll?: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations();
  const removeFile = useUploadStore((s) => s.remove);

  const fileActions: Record<UploadStatus, ReactNode> = {
    done: (
      <TooltipContainer side="bottom">
        <Button
          disabled
          variant={"icon"}
          leftIcon={<Delete size={isMultipartView ? 20 : 16} />}
        />
      </TooltipContainer>
    ),
    error: (
      <>
        <TooltipContainer content={t("common.buttons.retry")} side="bottom">
          <Button
            variant={"icon"}
            leftIcon={<Retry />}
            onClick={() => {
              retryFile(file.id).catch(console.error);
            }}
          />
        </TooltipContainer>
        <TooltipContainer content={t("common.buttons.delete")} side="bottom">
          <Button
            variant={"icon"}
            leftIcon={<Delete size={isMultipartView ? 20 : 16} />}
            onClick={() => {
              removeFile(file.id);
            }}
          />
        </TooltipContainer>
      </>
    ),
    uploading: (
      <TooltipContainer content={t("common.buttons.cancel")} side="bottom">
        <Button
          variant={"icon"}
          leftIcon={<Cancel />}
          onClick={() => {
            setFileToCancel(file);
            setIsOpenCancelFile(true);
            setIsCancelAll?.(false);
          }}
        />
      </TooltipContainer>
    ),
    queued: (
      <TooltipContainer content={t("common.buttons.cancel")} side="bottom">
        <Button
          variant={"icon"}
          leftIcon={<Cancel />}
          onClick={() => {
            setFileToCancel(file);
            setIsOpenCancelFile(true);
            setIsCancelAll?.(false);
          }}
        />
      </TooltipContainer>
    ),
    canceled: "",
  };

  return fileActions[file.status];
};

export const CancelUploadDialog = ({
  isOpen,
  toggleOpen,
  handleCancel,
  fileToCancel,
  cancelAll = false,
}: {
  isOpen?: boolean;
  toggleOpen: (open: boolean) => void;
  handleCancel: () => void;
  fileToCancel?: UploadItem;
  cancelAll?: boolean;
}) => {
  const t = useTranslations();
  const description = cancelAll
    ? t("buckets.files.multiparts.cancel.all_confirmation")
    : t.rich("buckets.files.multiparts.cancel.one_confirmation", {
        fileName: fileToCancel?.name,
        bold: I18nCustomTag(),
      });

  return (
    <BaseDialogContainer
      cancelText={t("common.buttons.cancel")}
      footerClassName="pr-[1.9375rem]"
      className="min-w-[44.25rem] pr-[0.0625rem]"
      isOpen={isOpen}
      okElement={
        <Button
          leftIcon={<Check />}
          onClick={() => {
            toggleOpen(false);
            handleCancel();
          }}
        >
          {t("buckets.files.multiparts.cancel.cancel_process")}
        </Button>
      }
      title={t("buckets.files.multiparts.cancel.title")}
      onCancel={() => {
        toggleOpen(false);
      }}
      onOpen={toggleOpen}
      description={description}
    />
  );
};
