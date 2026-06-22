"use client";

import { Button } from "@common/components/ui/button";
import { Card } from "@common/components/ui/card";

import { Save, X } from "@common/components/icons";

import { useEffect, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type ConfirmChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  cancelText?: string;
  saveText?: string;
  className?: string;
};

export default function ConfirmChangesDialog({
  open,
  onClose,
  onSave,
  isLoading = false,
  cancelText,
  saveText,
  className,
}: Readonly<ConfirmChangesDialogProps>) {
  const { t } = useLayoutStore((state) => state);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop + 60;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setIsAtBottom(scrollTop + windowHeight >= documentHeight);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSaveClick = () => {
    onSave().catch(console.error);
  };

  return (
    <Card
      className={cn(
        "fixed bottom-5 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-row items-center justify-center gap-3 px-4 py-3 shadow-D-X0-Y-1-B20-S0-20 duration-500 max-lg:bottom-14",
        {
          "bottom-[3.375rem] max-lg:bottom-44": isAtBottom,
        },
        { hidden: !open },
        className,
      )}
    >
      <Button
        leftIcon={<X />}
        variant="ghost"
        disabled={isLoading}
        onClick={onClose}
      >
        {cancelText ?? t("common.buttons.cancel")}
      </Button>
      <Button
        leftIcon={<Save />}
        isLoading={isLoading}
        disabled={isLoading}
        onClick={handleSaveClick}
      >
        {saveText ?? t("common.buttons.save")}
      </Button>
    </Card>
  );
}
