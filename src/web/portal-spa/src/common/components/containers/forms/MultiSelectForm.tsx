import FilterMultiselect, {
  type FilterMultiselectProps,
} from "@common/components/containers/selects/FilterMultiselect";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";

import { type OptionType } from "@common/lib/core/types";
import React from "react";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";

interface SelectFormProps extends Omit<
  FilterMultiselectProps,
  "onChangeSelectCustom"
> {
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  desc?: React.ReactNode;
  dependentField?: string[];
  classNameDesc?: string;
  className?: string;
  createLabel?: React.ReactNode;
  onCreate?: () => void;
}

const MultiSelectForm: React.FC<SelectFormProps> = ({
  label,
  name,
  required = false,
  desc,
  classNameDesc,
  className,
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
              <FilterMultiselect
                {...props}
                {...field}
                initValue={field.value as OptionType[]}
                className={className}
                onChangeSelectCustom={(e) => {
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

export default MultiSelectForm;
