"use client";

import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import toast from "@common/components/ui/toast";

import React, { useEffect } from "react";
import { cn } from "@common/lib/core/utils";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { usePathname } from "next/navigation";

const DialogContainer = () => {
  const pathname = usePathname();
  const router = useAppRouter();

  const {
    t,
    dialogProps: {
      isOpen,
      cancelText,
      title,
      dialogContent,
      onOpen,
      onCancel,
      className,
      okElement,
      description,
      footerClassName,
    },
    dialogButtonState: { isLoading, isValid, buttonProps, callbackAPI },
    setIsLoading,
    closeDialog,
    formData,
    formTrigger,
  } = useLayoutStore((state) => ({
    t: state.t,
    dialogProps: state.dialogProps,
    dialogButtonState: state.dialogButtonState,
    setIsLoading: state.setIsLoading,
    closeDialog: state.closeDialog,
    formData: state.formData,
    formTrigger: state.formTrigger,
  }));

  const handleClick = async () => {
    if (formTrigger) void formTrigger();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    const res = await callbackAPI(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.customError(res.error, res.status, res.statusText);
      return;
    }

    if (res.shouldRefresh) {
      router.refresh();
    }

    closeDialog();
  };

  useEffect(() => {
    closeDialog();
  }, [pathname]);

  return (
    <BaseDialogContainer
      cancelText={cancelText ?? t("common.date_picker.cancel")}
      className={(cn("min-w-[40.625rem]"), className)}
      isOpen={isOpen}
      title={title}
      okElement={
        okElement ?? (
          <Button
            {...buttonProps}
            leftIcon={buttonProps.leftIcon}
            isLoading={isLoading}
            onClick={() => {
              void handleClick();
            }}
          >
            {buttonProps.children ?? t("common.date_picker.save")}
          </Button>
        )
      }
      onOpen={onOpen}
      onCancel={onCancel}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
      }}
      description={description}
      footerClassName={footerClassName}
    >
      {dialogContent}
    </BaseDialogContainer>
  );
};

export default DialogContainer;
