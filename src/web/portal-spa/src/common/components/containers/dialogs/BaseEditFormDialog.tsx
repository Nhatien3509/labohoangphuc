import { Form } from "@common/components/ui/form";
import InputForm from "@common/components/containers/forms/InputForm";
import TextareaForm from "@common/components/containers/forms/TextareaForm";

import { useCustomForm } from "@common/hooks/useCustomForm";
import { useTranslations } from "next-intl";
import { z } from "zod";

type BasicInfo = {
  name: string;
  id: string;
  description?: string | null;
};

type BaseEditFormDialogProps<T extends BasicInfo> = Readonly<{
  data: T;
  labels: {
    name: string;
    id?: string;
  };
  isValidateMinLength?: boolean;
}>;

export default function BaseEditFormDialog<T extends BasicInfo>({
  data,
  labels,
  isValidateMinLength,
}: BaseEditFormDialogProps<T>) {
  const t = useTranslations();

  const schema = z.object({
    name: (() => {
      let s = z
        .string()
        .trim()
        .min(1, { message: t("common.validators.required") });
      if (isValidateMinLength) {
        s = s.min(2, { message: t("common.validators.min_length") });
      }
      return s.max(100, {
        message: t("common.validators.max_length", { max: 100 }),
      });
    })(),
    id: z.string(),
    description: z.string().optional().nullable(),
  });

  const form = useCustomForm({
    schema,
    defaultValues: {
      name: data.name,
      id: data.id,
      description: data.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <div className="space-y-3">
        <InputForm
          required
          showClearIcon
          label={labels.name}
          name="name"
          maxLength={100}
        />
        {labels.id && (
          <InputForm readOnly label={labels.id} name="id" value={data.id} />
        )}
        <TextareaForm
          showClearIcon
          label={t("common.description")}
          name="description"
          maxLength={255}
        />
      </div>
    </Form>
  );
}
