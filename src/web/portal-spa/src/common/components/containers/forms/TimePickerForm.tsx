"use client";

import {
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@common/components/ui/form";
import { TimePicker } from "@common/components/containers/datetime/TimePicker";

import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type TimePickerFormProps = {
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  desc?: string;
  placeholder?: string;
  disableMinutes?: boolean;
  showHours?: boolean;
  defaultValue?: string;
  showSeconds?: boolean;
  minuteStep?: number;
};

export function TimePickerForm({
  label = "",
  name,
  required = false,
  desc,
  placeholder = "",
  disableMinutes = false,
  showHours = true,
  defaultValue = "00:00:00",
  showSeconds = false,
  minuteStep = 5,
}: Readonly<TimePickerFormProps>) {
  const { control, setValue } = useFormContext();

  useEffect(() => {
    setValue(name, defaultValue);
  }, [name, defaultValue, setValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1">
          {label && (
            <div className="flex gap-1 space-x-1 text-base">
              {label} {required && <span className="text-primary-100"> *</span>}
            </div>
          )}
          <TimePicker
            showSeconds={showSeconds}
            disableMinutes={disableMinutes}
            minuteStep={minuteStep}
            placeholder={placeholder}
            showHours={showHours}
            selectedTime={(field.value as string) || undefined}
            onChange={(value) => {
              const [hours, min] = value.split(":");
              const updatedTime = `${String(hours).padStart(2, "0")}:${String(
                min ?? 0,
              ).padStart(2, "0")}:00`;
              field.onChange(updatedTime);
            }}
            hasError={!!control.getFieldState(name).error}
          />
          {desc && (
            <FormDescription className="text-base text-neutral-400">
              {desc}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
