"use-client";

import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import { Form } from "@common/components/ui/form";
import toast from "@common/components/ui/toast";

import InputForm from "@common/components/containers/forms/InputForm";
import { Send } from "@common/components/icons";
import TextareaForm from "@common/components/containers/forms/TextareaForm";

import { type Dispatch, type SetStateAction } from "react";
import { PHONE_REGEX } from "@common/lib/core/const";
import type { QuestionBody } from "@/api/common/types";
import { askQuestions } from "@/api/common/common.actions";
import { useForm } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type AskQuestionsDialogProps = Readonly<{
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}>;

function AskQuestionsDialog({ isOpen, setIsOpen }: AskQuestionsDialogProps) {
  const { currentUser, t } = useLayoutStore((state) => state);

  const formSchema = z.object({
    phoneNumber: z
      .string()
      .trim()
      .min(1, { message: t("common.ask_questions.required_validator") })
      .refine(
        (data) => {
          return !data || PHONE_REGEX.test(data.padStart(10, "0"));
        },
        {
          message: t("common.ask_questions.phone_number_validator"),
        },
      ),
    questions: z
      .string()
      .trim()
      .min(1, { message: t("common.ask_questions.required_validator") })
      .max(5000, {
        message: `${t("common.ask_questions.max_length_validator")} 5000`,
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      questions: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dataRequest: QuestionBody = {
      customerName: currentUser?.username ?? "",
      email: currentUser?.email ?? "",
      kind: "general",
      phoneNumber: values.phoneNumber,
      question: values.questions,
    };
    const response = await askQuestions(dataRequest);

    if (response.success) {
      toast(t("common.ask_questions.send_questions_successfully"));
    } else {
      toast.customError(response.error, response.status, response.statusText);
    }
    setIsOpen(false);
  };

  return (
    <BaseDialogContainer
      isOpen={isOpen}
      onOpen={(open) => {
        setIsOpen(open);
        form.reset();
      }}
      className="min-w-[31,25rem]"
      cancelText={t("common.ask_questions.cancel")}
      title={t("common.ask_questions.title")}
      okElement={
        <Button
          leftIcon={<Send size={18} />}
          type="submit"
          onClick={() => void form.handleSubmit(onSubmit)()}
        >
          {t("common.ask_questions.send_questions")}
        </Button>
      }
    >
      <Form {...form}>
        <div className="flex flex-col gap-6">
          <div>
            <p>{t("common.ask_questions.description1")}</p>
            <p>{t("common.ask_questions.description2")}</p>
          </div>

          <InputForm
            required
            showFlag
            className="rounded-bl-none rounded-tl-none"
            label={t("common.ask_questions.phone_number")}
            name="phoneNumber"
          />

          <TextareaForm
            required
            label={t("common.ask_questions.questions")}
            name="questions"
          />
        </div>
      </Form>
    </BaseDialogContainer>
  );
}

export default AskQuestionsDialog;
