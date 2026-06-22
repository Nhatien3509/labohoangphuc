"use client";

import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";

import { Send } from "@common/components/icons";

import React from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const ComingSoonDialog = () => {
  const { t, layoutDialogStates, updateLayoutDialogState } = useLayoutStore(
    (state) => state,
  );
  return (
    <BaseDialogContainer
      isOpen={layoutDialogStates.coming_soon.isOpen}
      onOpen={() => {
        updateLayoutDialogState({
          coming_soon: { isOpen: !layoutDialogStates.coming_soon.isOpen },
        });
      }}
      okElement={
        <Button
          onClick={() => {
            updateLayoutDialogState({
              subscription: { isOpen: true },
              coming_soon: { isOpen: false },
            });
          }}
          className={`dark:bg-primary-100`}
          leftIcon={<Send />}
        >
          {t("subscribe.title")}
        </Button>
      }
      cancelText={
        <span className="font-medium text-neutral-700">
          {t("common.actions.cancel")}
        </span>
      }
      title={t("nav_menu.announcement")}
      className={`!z-1 top-[30%] min-w-[30.75rem] !shadow-D-X0-Y0-B10-S0-30`}
      iconCloseClassName={"text-neutral-900"}
    >
      <span className="leading-6">{t("nav_menu.coming_soon_desc")}</span>
    </BaseDialogContainer>
  );
};

export default ComingSoonDialog;
