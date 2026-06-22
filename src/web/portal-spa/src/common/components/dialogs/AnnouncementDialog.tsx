import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@common/components/ui/dialog";
import { Button } from "@common/components/ui/button";

import { X } from "@common/components/icons";

import { Fragment, type ReactNode } from "react";
import { cn } from "@common/lib/core/utils";

type AnnouncementDialogProps = React.ComponentProps<"div"> & {
  isOpen: boolean;
  title?: string;
  icon?: ReactNode;
  messages?: ReactNode[];
  cancelButtonText?: string;
  cancelButtonIcon?: string | ReactNode;
  okButtonText?: string;
  okButtonIcon?: string | ReactNode;
  onOpen: (open: boolean) => void;
  onCancel: () => void;
  onOk?: () => void;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  isLoading?: boolean;
};

export default function AnnouncementDialog({
  isOpen,
  onOpen,
  title,
  messages,
  icon,
  cancelButtonText,
  cancelButtonIcon,
  okButtonText,
  okButtonIcon,
  onCancel,
  onOk,
  disableOkButton = false,
  disableCancelButton = false,
  isLoading = false,
  children,
  className,
}: AnnouncementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement;
          target.focus();
        }}
        className={cn(
          "min-w-[34.6875rem] text-center text-base dark:bg-neutral-dark-50 dark:text-neutral-0",
          className,
        )}
      >
        <DialogHeader></DialogHeader>
        <div className="mt-6 flex flex-col gap-3">
          {icon && <div className="flex justify-center">{icon}</div>}
          <DialogTitle className="text-md font-semibold leading-8 text-neutral-800">
            {title ?? ""}
          </DialogTitle>
          {!!messages?.length && (
            <DialogDescription className="whitespace-pre-line text-neutral-800">
              {messages.map((item) => {
                return <Fragment key={crypto.randomUUID()}>{item}</Fragment>;
              })}
            </DialogDescription>
          )}
          {children}
        </div>

        <DialogFooter className="!justify-center">
          {!disableCancelButton && (
            <Button
              disabled={isLoading}
              leftIcon={cancelButtonIcon ?? <X />}
              type="button"
              variant="tertiary"
              onClick={onCancel}
            >
              {cancelButtonText}
            </Button>
          )}

          {!disableOkButton && (
            <Button
              leftIcon={okButtonIcon}
              isLoading={isLoading}
              type="submit"
              onClick={onOk}
              disabled={isLoading}
            >
              {okButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
