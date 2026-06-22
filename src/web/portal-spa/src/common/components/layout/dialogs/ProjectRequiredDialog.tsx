"use client";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";

import { ArrowRight } from "@common/components/icons";

import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const ProjectRequiredDialog = () => {
  const { t, updateLayoutDialogState, layoutDialogStates } = useLayoutStore(
    (state) => state,
  );

  return (
    <BaseDialogContainer
      className="!min-w-[35.3125rem]"
      isOpen={layoutDialogStates.project_required.isOpen}
      onOpen={() => {
        updateLayoutDialogState({
          project_required: {
            isOpen: !layoutDialogStates.project_required.isOpen,
          },
        });
      }}
      okElement={
        <Button
          onClick={() => {
            updateLayoutDialogState({
              project_required: { isOpen: false },
              create_project: { isOpen: true },
            });
          }}
          className="rounded"
          rightIcon={<ArrowRight />}
        >
          {t("project_management.create_new_project")}
        </Button>
      }
      cancelText={
        <span className="font-medium text-neutral-700">
          {t("common.actions.cancel")}
        </span>
      }
      title={t("project_management.project_required")}
    >
      <span className="leading-6">
        {t("project_management.project_required_des")}
      </span>
    </BaseDialogContainer>
  );
};

export default ProjectRequiredDialog;
