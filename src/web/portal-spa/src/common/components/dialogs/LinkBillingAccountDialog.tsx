"use client";

import { Button } from "@common/components/ui/button";
import { Form } from "@common/components/ui/form";

import { Help, Plus, Save } from "@common/components/icons";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import CheckboxForm from "@common/components/containers/forms/CheckboxForm";
import InputForm from "@common/components/containers/forms/InputForm";
import SelectForm from "@common/components/containers/forms/SelectForm";

import { type GroupBase, type OptionProps, components } from "react-select";
import { type JSX } from "react";
import type { OptionType } from "@common/lib/core/types";
import { type Project } from "@/api/common/types";
import { VND } from "@common/lib/core/const";
import { useForm } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LinkBillingAccountDialog({
  open,
  setOpen,
  onSuccess,
  projectInfo,
}: Readonly<{
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  projectInfo: Project;
}>) {
  const { t } = useLayoutStore((state) => state);

  const formSchema = z.object({
    name: z.string(),
    slug: z.string(),
    enablePaymentLimitSetting: z.boolean(),
    weeklyLimit: z.number(),
    monthlyLimit: z.number(),
    yearlyLimit: z.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: projectInfo.name,
      slug: projectInfo.slug,
      enablePaymentLimitSetting: false,
      weeklyLimit: 0,
      monthlyLimit: 0,
      yearlyLimit: 0,
    },
    mode: "onChange",
  });

  const weeklyLimit = form.watch("weeklyLimit");
  const monthlyLimit = form.watch("monthlyLimit");
  const yearlyLimit = form.watch("yearlyLimit");

  const handleSubmit = () => {
    setOpen(false);
    onSuccess();
  };

  const options = [
    { value: "username1", label: "Username 1" },
    { value: "username2", label: "Username 2" },
    { value: "username3", label: "Username 3" },
    { value: "add-member", label: "Add member" },
  ];

  const AddMemberOption = (
    props: JSX.IntrinsicAttributes &
      OptionProps<unknown, boolean, GroupBase<unknown>>,
  ) => {
    return (
      <components.Option {...props}>
        <button
          className="flex gap-1"
          onClick={() => {
            return; // TODO: Link add member page
          }}
        >
          <Plus />
          <span>{t("common.link_billing_account.add_members")}</span>
        </button>
      </components.Option>
    );
  };

  return (
    <BaseDialogContainer
      cancelText={t("common.link_billing_account.cancel")}
      isOpen={open}
      title={t("common.link_billing_account.link_billing_account")}
      okElement={
        <Button
          leftIcon={<Save size={18} />}
          type="submit"
          onClick={handleSubmit}
        >
          {t("common.link_billing_account.link")}
        </Button>
      }
      onCancel={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(!open);
      }}
      onSubmit={() => {
        setOpen(false);
      }}
    >
      <div className="grid w-full gap-6">
        <Form {...form}>
          <form>
            <div className="grid grid-cols-2 gap-6 dark:border-neutral-300 dark:bg-neutral-dark-50">
              <div className="col-span-1 mr-3">
                <InputForm disabled label={t("project.name")} name="name" />
              </div>

              <div className="col-span-1 ml-3">
                <InputForm disabled label={t("project.slug")} name="slug" />
              </div>

              <div className="col-span-1 mr-3">
                <SelectForm
                  label={t("common.link_billing_account.billing_account")}
                  name="billing_account"
                  options={options}
                  placeholder=""
                  components={{
                    Option: (props) => {
                      const optionProps = props as OptionProps<OptionType>;
                      if (optionProps.data.value === "add-member") {
                        return <AddMemberOption {...props} />;
                      } else {
                        return <components.Option {...props} />;
                      }
                    },
                  }}
                />
              </div>

              <div className="col-span-1 ml-3">
                <div className="flex flex-col">
                  <div className="text-body-14">
                    <span className="font-bold">
                      {t("common.link_billing_account.note")}
                    </span>
                    <span>{t("common.link_billing_account.note_content")}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center">
                <CheckboxForm
                  name="enablePaymentLimitSetting"
                  label={
                    <span>
                      {t("common.link_billing_account.set_spending_limit")}
                    </span>
                  }
                />
                <Help className="ml-2 shrink-0" size={16} />
              </div>

              {form.getValues().enablePaymentLimitSetting && (
                <div className="col-span-2">
                  <div
                    className={`grid grid-cols-3 gap-6 ${weeklyLimit > monthlyLimit || monthlyLimit > yearlyLimit ? "[&_label]:text-destructive" : ""}`}
                  >
                    <div className="col-span-1">
                      <InputForm
                        inputMode="decimal"
                        name="weeklyLimit"
                        type="number"
                        label={
                          t("common.link_billing_account.weekly_limit") +
                          ` (${VND})`
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <InputForm
                        inputMode="decimal"
                        name="monthlyLimit"
                        type="number"
                        label={
                          t("common.link_billing_account.monthly_limit") +
                          ` (${VND})`
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <InputForm
                        inputMode="decimal"
                        name="yearlyLimit"
                        type="number"
                        label={
                          t("common.link_billing_account.yearly_limit") +
                          ` (${VND})`
                        }
                      />
                    </div>
                  </div>
                  {(weeklyLimit >= monthlyLimit ||
                    monthlyLimit >= yearlyLimit) && (
                    <p className="mt-1 text-red-800">
                      {t("common.link_billing_account.limit_validator")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </BaseDialogContainer>
  );
}
