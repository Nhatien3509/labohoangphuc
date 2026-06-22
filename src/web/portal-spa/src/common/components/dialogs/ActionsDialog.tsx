"use client";

import { Button } from "@common/components/ui/button";
import { Card } from "@common/components/ui/card";

import { Delete, X } from "@common/components/icons";

import React, { type ReactNode, useEffect, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type ActionsDialogProps = {
  selected: number;
  handleClose: () => void;
  handleDelete: () => void;
  icon?: ReactNode;
  actionMessage?: string;
  isLoading?: boolean;
};

function ActionsDialog({
  selected,
  handleClose,
  handleDelete,
  icon,
  actionMessage,
  isLoading = false,
}: Readonly<ActionsDialogProps>) {
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

  return (
    <Card
      className={cn(
        "fixed bottom-5 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-row items-center gap-6 px-4 py-6 shadow-D-X0-Y-1-B20-S0-20 duration-500 max-lg:bottom-14",
        {
          "bottom-[3.375rem] max-lg:bottom-44": isAtBottom,
        },
        { hidden: !selected },
      )}
    >
      <div className="whitespace-nowrap text-base">
        {t("common.actions.selected")}
        <span className="font-semibold">
          {selected} {t("common.actions.items")}
        </span>
      </div>
      <Button
        leftIcon={icon ?? <Delete size={18} />}
        isLoading={isLoading}
        variant={"secondary"}
        onClick={() => {
          handleDelete();
        }}
        disabled={isLoading}
      >
        {actionMessage ?? t("common.actions.delete_selected")}
      </Button>
      <Button
        className="focus-visible h-auto w-fit p-0 text-neutral-800 !shadow-none"
        variant={"text"}
        disabled={isLoading}
      >
        <X
          onClick={() => {
            handleClose();
          }}
        />
      </Button>
    </Card>
  );
}

export default ActionsDialog;
