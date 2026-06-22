import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@common/components/ui/form";
import { RadioGroup } from "@common/components/ui/radio-group";

import React, { type ReactNode } from "react";
import { useFormContext } from "react-hook-form";

type RadioGroupFormProps = {
  label?: ReactNode;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  children: ReactNode;
  onValueChange?: (value: string) => void;
};

function RadioGroupForm({
  defaultValue,
  disabled = false,
  label,
  name,
  required,
  value,
  children,
  onValueChange,
  ...props
}: Readonly<RadioGroupFormProps>) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <div className="mb-1 text-base">
              {label} {required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <FormControl>
            <RadioGroup
              defaultValue={defaultValue}
              disabled={disabled}
              value={value}
              onValueChange={(e) => {
                field.onChange(e);
                onValueChange?.(e);
              }}
              {...props}
            >
              {children}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default RadioGroupForm;
