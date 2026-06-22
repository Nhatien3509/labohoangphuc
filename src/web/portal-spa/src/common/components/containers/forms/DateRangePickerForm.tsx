import {
  DatePicker,
  type DatePickerProps,
} from "@common/components/containers/datetime/DatePicker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";

import { type DateRange } from "react-day-picker";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";

interface DateRangePickerFormProps extends Omit<
  DatePickerProps,
  "onChangeSelectedDate"
> {
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  desc?: React.ReactNode;
  dependentField?: string[];
  classNameDesc?: string;
  createLabel?: React.ReactNode;
  onCreate?: () => void;
}

const DateRangePickerForm: React.FC<DateRangePickerFormProps> = ({
  label,
  name,
  required = false,
  desc,
  classNameDesc,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-col gap-1">
            {label && (
              <FormLabel className="text-base">
                {label}
                {required && <span className="text-primary-100"> *</span>}
              </FormLabel>
            )}
            {desc && (
              <FormDescription
                className={cn(classNameDesc, "text-base text-neutral-400")}
              >
                {desc}
              </FormDescription>
            )}
            <FormControl>
              <DatePicker
                {...props}
                defaultSelectedDate={field.value as DateRange}
                onChangeSelectedDate={(e) => {
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DateRangePickerForm;
