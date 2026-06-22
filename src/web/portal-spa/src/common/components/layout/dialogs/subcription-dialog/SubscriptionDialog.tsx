"use client";

import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import toast from "@common/components/ui/toast";

import DialogContent from "@common/components/layout/dialogs/subcription-dialog/DialogContent";
import { Send } from "@common/components/icons";

import {
  type SubscriptionSchemaType,
  subscriptionSchema,
} from "@common/components/layout/dialogs/subcription-dialog/schemas";
import type { QuestionBody } from "@/api/common/types";
import React from "react";
import { TELEPHONE_COUNTRY_CODES } from "@common/lib/core/const";
import { askQuestions } from "@/api/common/common.actions";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useForm } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

const SubscriptionDialog = () => {
  const { t, layoutDialogStates, updateLayoutDialogState, currentUser } =
    useLayoutStore((state) => state);
  const { locale } = useParams<{ locale?: string }>();
  const { executeAction, isLoading } = useActionAPI();

  const defaultArea = TELEPHONE_COUNTRY_CODES.find((item) =>
    locale?.toLowerCase() === "vi" ? item.code === "vn" : item.code === "us",
  );

  const form = useForm<SubscriptionSchemaType>({
    resolver: zodResolver(subscriptionSchema(t)),
    defaultValues: {
      question: "",
      email: "",
      phone: "",
      countryCode: {
        value: String(defaultArea?.phone),
        label: t(`countries.${defaultArea?.code ?? "vn"}`),
      },
    },
    mode: "onChange",
  });

  const onSubmit = async (values: SubscriptionSchemaType) => {
    const comingSoon = layoutDialogStates.coming_soon;
    const payload: QuestionBody = {
      customerName: currentUser?.displayName ?? "",
      kind: "other",
      phoneNumber: `${values.countryCode.value}${values.phone}`,
      email: values.email,
      context: {
        service: comingSoon.serviceName ?? "",
      },
      question: values.question,
    };
    const res = await executeAction(askQuestions, payload);
    if (!res?.success) return;
    toast(t("subscribe.subscribe_successfully"));
    form.reset();
    updateLayoutDialogState({
      subscription: { isOpen: false },
    });
  };

  return (
    <BaseDialogContainer
      isOpen={layoutDialogStates.subscription.isOpen}
      onOpen={() => {
        form.reset();
        updateLayoutDialogState({
          subscription: {
            isOpen: !layoutDialogStates.subscription.isOpen,
          },
        });
      }}
      okElement={
        <Button
          onClick={() => void form.handleSubmit(onSubmit)()}
          className="dark:bg-primary-100"
          disabled={isLoading}
          isLoading={isLoading}
          leftIcon={<Send />}
        >
          {layoutDialogStates.subscription.title ?? t("subscribe.title")}
        </Button>
      }
      description={
        <span className="leading-6">
          {layoutDialogStates.subscription.description ??
            t("subscribe.description")}
        </span>
      }
      cancelText={
        <span className="font-medium text-neutral-700">
          {t("common.actions.close")}
        </span>
      }
      title={layoutDialogStates.subscription.title ?? t("subscribe.title")}
      className="min-w-[30.75rem]"
      iconCloseClassName={"text-neutral-900"}
    >
      <DialogContent {...{ form, t }} />
    </BaseDialogContainer>
  );
};

export default SubscriptionDialog;
