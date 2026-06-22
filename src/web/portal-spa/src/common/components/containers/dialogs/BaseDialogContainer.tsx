import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@common/components/ui/dialog";
import { Button } from "@common/components/ui/button";

import { Close } from "@common/components/icons";

import { type DialogContentProps } from "@radix-ui/react-dialog";
import { type ReactNode } from "react";
import { cn } from "@common/lib/core/utils";

export type InfoDialogProps = Omit<React.ComponentProps<"div">, "title"> &
  Omit<DialogContentProps, "title"> & {
    isOpen?: boolean;
    isLoading?: boolean;
    title?: ReactNode;
    description?: ReactNode;
    okElement?: ReactNode;
    cancelText?: ReactNode;
    cancelIcon?: ReactNode;
    trigger?: ReactNode;
    onOpen?: (isOpen: boolean) => void;
    onCancel?: () => void;
    onCancelMouseDown?: () => void;
    footerClassName?: string;
    iconCloseClassName?: string;
    overlayClassName?: string;
    dialogCloseClassName?: string;
  };

export default function BaseDialogContainer({
  isOpen,
  isLoading,
  title,
  description,
  okElement,
  cancelText,
  cancelIcon = <Close />,
  trigger,
  onCancel,
  onCancelMouseDown,
  onOpen,
  children,
  footerClassName,
  iconCloseClassName,
  overlayClassName,
  dialogCloseClassName,
  ...props
}: InfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        {...props}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement;
          target.focus();
        }}
        className={cn(
          "top-[min(10.3125rem,18vh)] max-h-[80vh] min-w-[41.625rem] translate-y-0 text-base dark:bg-neutral-dark-50 dark:text-neutral-0 max-sm:min-w-[95vw] max-sm:max-w-[95vw]",
          props.className,
        )}
        tabIndex={-1}
        iconCloseClassName={iconCloseClassName}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle className="text-left font-semibold leading-8">
            {title ?? ""}
          </DialogTitle>
          <DialogDescription className={description ? "" : "hidden"}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}

        <DialogFooter className={cn("sm:justify-end", footerClassName)}>
          <DialogClose asChild>
            <Button
              disabled={isLoading}
              className={cn("active:bg-neutral-100", dialogCloseClassName)}
              leftIcon={cancelIcon}
              type="button"
              variant="tertiary"
              onClick={onCancel}
              onMouseDown={onCancelMouseDown}
            >
              {cancelText}
            </Button>
          </DialogClose>
          {okElement}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
