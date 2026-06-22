"use client";

import AsyncSelectContainer, {
  type AsyncSelectContainerProps,
} from "@common/components/containers/selects/AsyncSelectContainer";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import SelectContainer from "@common/components/containers/selects/SelectContainer";

import {
  type ControllerRenderProps,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import type { OptionType } from "@common/lib/core/types";
import React from "react";
import type { SelectOption } from "@common/components/ui/async-select";
import { type SelectProps } from "@common/components/ui/select";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type BaseFormFieldProps = {
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  desc?: React.ReactNode;
  dependentField?: string[];
  classNameDesc?: string;
  onChangeValue?: (value: unknown) => void;
};
export interface SelectFormProps
  extends Omit<SelectProps, "name">, BaseFormFieldProps {}

export interface AsyncSelectFormProps<T>
  extends Omit<AsyncSelectContainerProps<T>, "name">, BaseFormFieldProps {}

type BaseSelectFormProps<Value extends { value: unknown }> = {
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  desc?: React.ReactNode;
  dependentField?: string[];
  classNameDesc?: string;
  onChangeValue?: (value: unknown) => void;
  isMulti?: boolean;
  renderSelect: (args: {
    field: ControllerRenderProps<FieldValues, string>;
    fieldValue: Value | null;
    hasError: boolean;
    onChange: (value: Value | null) => void;
  }) => React.ReactNode;
};

const BaseSelectForm = <Value extends { value: unknown }>({
  label,
  name,
  required = false,
  desc,
  dependentField = [],
  classNameDesc,
  onChangeValue,
  isMulti,
  renderSelect,
}: BaseSelectFormProps<Value>) => {
  const { control, resetField } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: Value | null) => {
          const prev = field.value as Value | null;

          if (e && !isMulti && prev && prev.value === e.value) {
            return;
          }

          if (dependentField.length) {
            const isChanged = (() => {
              if (!prev && !e) return false;
              if (!prev || !e) return true;
              if (isMulti) {
                return true;
              }
              return prev.value !== e.value;
            })();

            if (isChanged) {
              dependentField.forEach((i) => {
                resetField(i, {
                  keepError: true,
                });
              });
            }
          }

          field.onChange(e);
          onChangeValue?.(e);
        };

        const hasError = !!control.getFieldState(name).error;

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
              {renderSelect({
                field,
                fieldValue: (field.value as Value | null) ?? null,
                hasError,
                onChange: handleChange,
              })}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const SelectForm: React.FC<SelectFormProps> = ({
  label,
  name,
  required = false,
  desc,
  dependentField = [],
  classNameDesc,
  onChangeValue,
  isAllowedAccess,
  isCreatable,
  ...props
}) => {
  const isNavigating = useLayoutStore((state) => state.isNavigating);

  return (
    <BaseSelectForm<OptionType>
      label={label}
      name={name}
      required={required}
      desc={desc}
      dependentField={dependentField}
      classNameDesc={classNameDesc}
      onChangeValue={onChangeValue}
      isMulti={props.isMulti}
      renderSelect={({ field, fieldValue, hasError, onChange }) => (
        <SelectContainer
          {...props}
          {...field}
          readOnly={isNavigating || props.readOnly}
          isAllowedAccess={isAllowedAccess}
          isCreatable={isCreatable}
          value={fieldValue}
          onChange={(value) => {
            onChange((value as OptionType | null) ?? null);
          }}
          hasError={hasError}
        />
      )}
    />
  );
};

export const AsyncSelectForm = <T,>({
  label,
  name,
  required = false,
  desc,
  dependentField = [],
  classNameDesc,
  onChangeValue,
  isAllowedAccess,
  isCreatable,
  ...props
}: AsyncSelectFormProps<T>) => {
  const isNavigating = useLayoutStore((state) => state.isNavigating);

  return (
    <BaseSelectForm<SelectOption<T>>
      label={label}
      name={name}
      required={required}
      desc={desc}
      dependentField={dependentField}
      classNameDesc={classNameDesc}
      onChangeValue={onChangeValue}
      isMulti={props.isMulti}
      renderSelect={({ field, fieldValue, hasError, onChange }) => (
        <AsyncSelectContainer<T>
          {...props}
          {...field}
          readOnly={isNavigating || props.readOnly}
          isAllowedAccess={isAllowedAccess}
          isCreatable={isCreatable}
          value={fieldValue}
          onChange={(value) => {
            onChange((value as SelectOption<T> | null) ?? null);
          }}
          hasError={hasError}
        />
      )}
    />
  );
};

export default SelectForm;
