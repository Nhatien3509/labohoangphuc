import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import toast from "@common/components/ui/toast";

import { ClearContent, Leave } from "@common/components/icons";

import { type DialogContentProps } from "@radix-ui/react-dialog";

type BasicProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
};
const leaveProject = (_id: string) =>
  Promise.resolve({ success: false, status: 0 } as const);
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useState } from "react";

type LeaveProjectDialogProps = React.ComponentProps<"div"> &
  DialogContentProps & {
    isOpen: boolean;
    toggleOpen: (open: boolean) => void;
    project: BasicProject | null;
    onSuccess: (projectId: string) => void;
  };

export default function LeaveProjectDialog({
  isOpen,
  project,
  onSuccess,
  toggleOpen,
  ...props
}: LeaveProjectDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationTextChanged, setConfirmationTextChanged] = useState(false);
  const { isLoading, executeAction } = useActionAPI();

  const { t } = useLayoutStore((state) => state);

  if (!project) return;

  const onSubmit = async () => {
    const res = await executeAction(leaveProject, project.id);
    if (!res?.success) return;
    onSuccess(project.id);
    toggleOpen(false);
    setConfirmationText("");
    setConfirmationTextChanged(false);
    toast(t("common.leave_project.successfully"));
  };

  return (
    <BaseDialogContainer
      {...props}
      cancelText={t("common.leave_project.close")}
      isOpen={isOpen}
      title={t("common.leave_project.title")}
      okElement={
        <Button
          disabled={confirmationText !== project.slug}
          leftIcon={<Leave size={20} />}
          isLoading={isLoading}
          onClick={() => {
            if (isLoading) return;
            void onSubmit();
          }}
        >
          {t("common.leave_project.title")}
        </Button>
      }
      onCancel={() => {
        toggleOpen(false);
      }}
      onOpen={(isOpen) => {
        setConfirmationText("");
        setConfirmationTextChanged(false);
        toggleOpen(isOpen);
      }}
    >
      <div className="grid gap-3">
        <div>
          {t("common.leave_project.confirmation")}
          <span className="break-all font-semibold">{project.name}</span>?
        </div>

        <div>
          <div>{t("common.leave_project.project_slug")}:</div>
          <div className="break-all font-bold">{project.slug}</div>
        </div>

        <div className="space-y-1">
          <p>
            {t("common.leave_project.confirmation_message1")}
            <span className="font-bold">{project.slug}</span>
            {t("common.leave_project.confirmation_message2")}
          </p>

          <Input
            className={`focus-visible:ring-none ${confirmationTextChanged && confirmationText !== project.slug ? "!border-red-800" : ""}`}
            id="leave-project-confirmation"
            maxLength={50}
            value={confirmationText}
            rightIcon={
              confirmationText && (
                <div>
                  <TooltipContainer content={t("common.actions.delete")}>
                    <p>
                      <ClearContent
                        onClick={() => {
                          setConfirmationText("");
                        }}
                      />
                    </p>
                  </TooltipContainer>
                </div>
              )
            }
            onChange={(e) => {
              if (!confirmationTextChanged) {
                setConfirmationTextChanged(true);
              }
              setConfirmationText(e.target.value);
            }}
          />

          {confirmationTextChanged && confirmationText !== project.slug && (
            <div className="mt-1 text-red-800">
              {t("common.leave_project.enter_confirmation_text")}
            </div>
          )}
        </div>
      </div>
    </BaseDialogContainer>
  );
}
