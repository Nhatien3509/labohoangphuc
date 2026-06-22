"use client";

import {
  type DefaultValues,
  type FieldValues,
  type Path,
  useForm,
  useWatch,
} from "react-hook-form";
import { useEffect, useRef } from "react";
import equal from "fast-deep-equal";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type UseCustomFormProps<T extends FieldValues> = {
  schema: z.ZodType<T>;
  defaultValues: Partial<T>;
};

export function useCustomForm<T extends FieldValues>({
  schema,
  defaultValues,
}: UseCustomFormProps<T>) {
  const { setIsValid, setFormData, setFormTrigger } = useLayoutStore(
    (state) => state,
  );
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
    mode: "onChange",
  });
  const currentValues = useWatch({ control: form.control });
  const watchedValuesRef = useRef<Partial<T>>(defaultValues);

  useEffect(() => {
    setFormData(defaultValues);
    setFormTrigger<T>(form.trigger);
  }, []);

  useEffect(() => {
    if (equal(currentValues, watchedValuesRef.current)) return;

    watchedValuesRef.current = currentValues;
    setFormData(currentValues);
  }, [currentValues]);

  useEffect(() => {
    setIsValid(form.formState.isValid);
  }, [form.formState.isValid]);

  useEffect(() => {
    const errors = form.formState.errors;

    const firstErrorKey = Object.keys(errors).find((key) => key !== "root");

    if (!firstErrorKey) return;

    form.setFocus(firstErrorKey as Path<typeof form.getValues>);
  }, [form.formState.errors, form.setFocus]);

  return form;
}
