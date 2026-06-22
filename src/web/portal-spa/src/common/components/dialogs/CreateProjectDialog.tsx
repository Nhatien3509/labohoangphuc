"use client";

import AnnouncementDialog from "@common/components/dialogs/AnnouncementDialog";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import { Form } from "@common/components/ui/form";
import InputForm from "@common/components/containers/forms/InputForm";
import TextareaForm from "@common/components/containers/forms/TextareaForm";
import toast from "@common/components/ui/toast";

import { ArrowRight, Check, Plus, Success } from "@common/components/icons";

import React, { useState } from "react";
import type { Project } from "@/api/common/types";
import { ROUTES } from "@common/lib/core/routes";
const createProject = (_values: unknown) =>
  Promise.resolve({ success: false, status: 0, data: undefined } as const);
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useAppRouter } from "@common/hooks/useAppRouter";
import { useForm } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function CreateProjectDialog() {
  const router = useAppRouter();

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Project>();
  const {
    t,
    currentUser,
    currentProject,
    updateCurrentProject,
    layoutDialogStates,
    updateLayoutDialogState,
  } = useLayoutStore((state) => state);
  const { isLoading, executeAction } = useActionAPI();

  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t("common.create_project.enter_info"),
      }),
    description: z.string().trim(),
    enableIam: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      enableIam: true,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (currentUser?.remainingProjects === 0) {
      toast(
        <span>
          {t("common.create_project.max_projects_message1")}{" "}
          <span className="font-bold">{currentUser.maxProjects ?? 0}</span>{" "}
          {t("common.create_project.max_projects_message2")}
        </span>,
      );
      return;
    }

    const res = await executeAction(createProject, values);

    if (!res?.success) return;

    if (!currentProject) await updateCurrentProject(res.data);

    setNewProjectData(res.data);
    form.reset();
    layoutDialogStates.create_project.onSuccess?.(res.data);
    updateLayoutDialogState({
      create_project: { isOpen: false },
    });
    setSuccessDialogOpen(true);
  };

  return (
    <>
      <BaseDialogContainer
        className="min-w-[34.6875rem]"
        description={
          <span>
            {t("common.create_project.desc1")}{" "}
            <span className="font-bold">
              {currentUser?.remainingProjects ?? 0}{" "}
            </span>
            {t("common.create_project.desc2")}
          </span>
        }
        cancelText={t("common.create_project.cancel")}
        isOpen={layoutDialogStates.create_project.isOpen}
        title={t("common.create_project.title")}
        okElement={
          <Button
            disabled={currentUser?.remainingProjects === 0 || isLoading}
            isLoading={isLoading}
            leftIcon={<Check />}
            type="submit"
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
            {t("common.create_project.title")}
          </Button>
        }
        onCancel={() => {
          updateLayoutDialogState({
            create_project: { isOpen: false },
          });
        }}
        onOpen={(open) => {
          form.reset();
          updateLayoutDialogState({
            create_project: { isOpen: open },
          });
        }}
      >
        <Form {...form}>
          <form>
            <div className="flex flex-col gap-3 dark:border-neutral-300 dark:bg-neutral-dark-50">
              <InputForm
                required
                showClearIcon
                maxLength={100}
                label={t("common.create_project.project_name")}
                name="name"
              />
              <TextareaForm
                maxLength={255}
                label={t("common.create_project.project_desc")}
                name="description"
              />
            </div>
          </form>
        </Form>
      </BaseDialogContainer>

      <AnnouncementDialog
        cancelButtonIcon={<Plus />}
        cancelButtonText={t("common.create_project.more")}
        icon={<Success />}
        isOpen={successDialogOpen}
        messages={[t("common.create_project.success_message")]}
        okButtonIcon={<ArrowRight />}
        okButtonText={t("common.create_project.view")}
        title={t("common.create_project.successfully")}
        onOk={() => {
          updateCurrentProject(newProjectData)
            .then(() => {
              setSuccessDialogOpen(false);
              layoutDialogStates.create_project.setIsOpenProjectManagement?.(
                false,
              );
              router.push(ROUTES.project.home);
            })
            .catch(console.error);
        }}
        onOpen={() => {
          setSuccessDialogOpen(!successDialogOpen);
        }}
        onCancel={() => {
          form.reset();
          setSuccessDialogOpen(false);
          updateLayoutDialogState({
            create_project: { isOpen: true },
          });
        }}
      />
    </>
  );
}
