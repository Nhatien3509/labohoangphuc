"use client";

import { Button } from "@common/components/ui/button";
import CardContainer from "@common/components/containers/cards/CardContainer";
import { Form } from "@common/components/ui/form";
import InputForm from "@common/components/containers/forms/InputForm";

import NotFoundCleanup from "@common/components/layout/NotFoundCleanup";

import { BASE_PATH } from "@common/lib/core/const";
import React from "react";
import { useForm } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

function BasicAuth() {
  const t = useLayoutStore((s) => s.t);

  const formSchema = z.object({
    username: z
      .string({ message: t("common.validators.required") })
      .trim()
      .min(1, { message: t("common.validators.required") }),
    password: z
      .string({ message: t("common.validators.required") })
      .trim()
      .min(1, { message: t("common.validators.required") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await fetch(`${BASE_PATH}/auth/basic-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values }),
    });

    if (res.ok) {
      window.location.href = `${BASE_PATH}/`;
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)().catch(console.error);
    }
  };

  return (
    <Form {...form}>
      <CardContainer
        contentclassName={"space-y-4 pt-6"}
        className={"m-auto mt-4 w-[23.625rem]"}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div>{t("auth.sign_in")}</div>
        <InputForm name="username" label={t("auth.username")} required />
        <InputForm
          name="password"
          label={t("auth.password")}
          type="password"
          required
        />
        <Button
          className="m-auto flex"
          type={"submit"}
          onClick={() => {
            form.handleSubmit(onSubmit)().catch(console.error);
          }}
        >
          {t("auth.sign_in")}
        </Button>
      </CardContainer>
      <NotFoundCleanup />
    </Form>
  );
}

export default BasicAuth;
