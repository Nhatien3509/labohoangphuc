import AnnouncementDialog from "@common/components/dialogs/AnnouncementDialog";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

import { Send, Warning } from "@common/components/icons";

import React from "react";

type MaxProjectsWarningDialogProps = {
  isWarningOpen: boolean;
  setIsWarningOpen: React.Dispatch<React.SetStateAction<boolean>>;
  limit: number;
};

const MaxProjectsWarningDialog = ({
  isWarningOpen,
  setIsWarningOpen,
  limit,
}: MaxProjectsWarningDialogProps) => {
  const { t, updateLayoutDialogState } = useLayoutStore((state) => state);
  return (
    <AnnouncementDialog
      onCancel={() => {
        setIsWarningOpen(false);
      }}
      className="!top-[22rem]"
      cancelButtonText={t("common.actions.close")}
      okButtonIcon={<Send size={18} />}
      okButtonText={t("project_management.send_request")}
      isOpen={isWarningOpen}
      onOpen={setIsWarningOpen}
      onOk={() => {
        setIsWarningOpen(false);
        updateLayoutDialogState({
          subscription: {
            isOpen: true,
            title: t("project_management.send_request"),
            description: t("project_management.send_request_desc"),
          },
        });
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <Warning size={64} />
        <span className="text-xl font-semibold">
          {t("project_management.warning")}
        </span>
        <p className="text-center">
          {t("project_management.warning_desc")}
          <b className="font-extrabold">{` ${limit} `}</b>
          {t("project_management.projects")}. <br />
          {t("project_management.warning_desc2")}
        </p>
      </div>
    </AnnouncementDialog>
  );
};

export default MaxProjectsWarningDialog;
