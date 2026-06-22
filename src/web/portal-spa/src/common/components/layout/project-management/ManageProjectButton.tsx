import { Button } from "@common/components/ui/button";

import { CaretRight, OutlinedLayers } from "@common/components/icons";
import TooltipText from "@common/components/containers/TooltipText";

import React from "react";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const ManageProjectButton = ({
  setIsOpenMangementDialog,
  triggerClassName,
}: {
  setIsOpenMangementDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  triggerClassName?: string;
}) => {
  const { updateLayoutDialogState, t, currentProject } = useLayoutStore(
    (state) => state,
  );

  return (
    <Button
      onClick={() => {
        if (setIsOpenMangementDialog) {
          setIsOpenMangementDialog(true);
          return;
        }
        updateLayoutDialogState({
          create_project: {
            isOpen: true,
          },
        });
      }}
      shape="round"
      variant="secondary"
      className={cn(
        "group/item h-[2.875rem] w-fit min-w-[6.25rem] max-w-[12.5rem] items-center justify-between gap-0 py-2.5 pl-4 pr-3 text-neutral-800 dark:border-neutral-0 dark:bg-transparent dark:text-neutral-0",
        "hover:bg-primary-100 hover:text-neutral-0 hover:dark:bg-neutral-dark-bg hover:dark:shadow-D-X0-Y2-B2-S0-30",
        "active:shadow-I-X2-Y2-B4-S0-25 active:dark:border-primary-200 active:dark:shadow-I-X0-Y0-B6-S0-30",
        triggerClassName,
        "max-lg:min-w-fit max-lg:px-6",
      )}
    >
      <div className="flex items-center">
        <OutlinedLayers className="mr-3 text-neutral-700 group-hover/item:text-neutral-0 dark:text-neutral-0 max-lg:mr-0" />
        {setIsOpenMangementDialog ? (
          <TooltipText
            maxWidth={6.875}
            tooltipProps={{
              sideOffset: 8,
            }}
            content={currentProject?.name ?? ""}
            className="text-md font-medium max-lg:hidden"
          />
        ) : (
          <p className="w-[6.875rem] text-left text-md font-medium">
            {t("common.create_project.title")}
          </p>
        )}
        <CaretRight className="ml-2 shrink-0 group-hover/item:text-neutral-0 dark:text-neutral-0 max-lg:hidden" />
      </div>
    </Button>
  );
};

export default ManageProjectButton;
