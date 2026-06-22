import CountryCodeSelect from "@common/components/containers/forms/CountryCodeSelect";
import { Form } from "@common/components/ui/form";
import InputForm from "@common/components/containers/forms/InputForm";
import { Label } from "@common/components/ui/label";
import TextareaForm from "@common/components/containers/forms/TextareaForm";

import React from "react";
import { type SubscriptionSchemaType } from "@common/components/layout/dialogs/subcription-dialog/schemas";
import { type UseFormReturn } from "react-hook-form";

const DialogContent = ({
  form,
  t,
}: {
  form: UseFormReturn<SubscriptionSchemaType>;
  t: (key: string) => string;
}) => (
  <Form {...form}>
    <div className="space-y-4">
      <InputForm
        showClearIcon
        maxLength={255}
        name="email"
        required
        label="Email"
      />
      <div className="flex flex-col items-start gap-1">
        <Label>
          <div className="flex items-center gap-0.5">
            {t("subscribe.phone")}
            {<span className="text-primary-100"> *</span>}
          </div>
        </Label>
        <div className="flex w-full gap-2">
          <CountryCodeSelect name="countryCode" />
          <div className="flex-1">
            <InputForm
              showClearIcon
              className="h-8"
              name="phone"
              required
              onInput={(e) => {
                const input = e.currentTarget;
                const digits = input.value.replace(/\D/g, "");

                input.value = digits.startsWith("0")
                  ? digits.slice(0, 10)
                  : digits.slice(0, 9);
              }}
            />
          </div>
        </div>
      </div>

      <TextareaForm
        maxLength={5000}
        showClearIcon
        className="min-h-[5.4375rem]"
        name="question"
        required
        label={t("subscribe.message")}
      />
    </div>
  </Form>
);

export default DialogContent;
