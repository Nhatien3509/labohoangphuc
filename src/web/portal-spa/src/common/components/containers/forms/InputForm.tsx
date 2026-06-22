import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import { Input, type InputProps } from "@common/components/ui/input";
import InputActionsForm from "@common/components/containers/forms/InputActionsForm";
import { Label } from "@common/components/ui/label";

import { VietnamFlag } from "@common/components/icons";

import {
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
  useFormContext,
} from "react-hook-form";
import {
  INVALID_NUMERIC_CHARACTERS,
  LEADING_ZEROS_REGEX,
} from "@common/lib/core/const";
import React, { type ReactNode } from "react";
import CurrencyInput from "react-currency-input-field";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type InputFormProps = {
  name: string;
  bottomDesc?: ReactNode;
  unit?: string;
  readOnly?: boolean;
  readOnlyForm?: boolean;
  value?: string;
  required?: boolean;
  showCurrencyUnit?: boolean;
  showClearIcon?: boolean;
  showUndoIcon?: boolean;
  showFlag?: boolean;
  isCurrency?: boolean;
  isDecimal?: boolean;
  inputActionsClassname?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Allow custom onChange handler
  onChangeCurrency?: (value?: string) => void;
} & InputProps;

const InputForm = ({
  label,
  name,
  desc,
  bottomDesc,
  unit,
  readOnly = false,
  readOnlyForm = false,
  value = "",
  required = false,
  showCurrencyUnit = false,
  showClearIcon = false,
  showUndoIcon = false,
  showCopyIcon = false,
  showFlag = false,
  isCurrency = false,
  isDecimal = true,
  inputActionsClassname,
  onChange,
  onChangeCurrency,
  onBlur,
  ...props
}: InputFormProps) => {
  const { control } = useFormContext();
  const isNavigating = useLayoutStore((state) => state.isNavigating);

  const { defaultValue, ...restProps } = props;
  const isNumberInput = (props as InputProps).type === "number";

  return (
    <>
      {readOnly ? (
        <Label className="grid items-center gap-1">
          {label ?? ""}
          <Input
            readOnly
            id={name}
            showCopyIcon={showCopyIcon}
            value={value}
            {...props}
          />
        </Label>
      ) : (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="group/input-form flex flex-col gap-1">
              {label && (
                <FormLabel>
                  {label}{" "}
                  {required && <span className="text-primary-100"> *</span>}
                </FormLabel>
              )}

              {desc && (
                <FormDescription className="text-base text-neutral-400">
                  {desc}
                </FormDescription>
              )}

              <div className="flex items-center gap-3">
                <div className="relative flex grow items-center">
                  {showFlag && (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-bl-sm rounded-tl-sm border border-neutral-200 px-2 py-[0.4375rem] text-base",
                        {
                          "bg-neutral-50": readOnlyForm,
                          "dark:bg-neutral-dark-400": readOnlyForm,
                        },
                      )}
                    >
                      <VietnamFlag />
                      <span>+84</span>
                    </div>
                  )}
                  <FormControl>
                    {isCurrency ? (
                      <CurrencyInput
                        autoComplete="off"
                        {...restProps}
                        readOnly={readOnlyForm}
                        name={name}
                        value={field.value as number}
                        groupSeparator="."
                        decimalSeparator=","
                        className={cn(
                          "flex h-9 w-full rounded-sm border border-neutral-200 px-3 text-base file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-neutral-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-300 dark:bg-neutral-dark-50",
                          "hover:border-neutral-400 hover:shadow-D-X0-Y0-B6-S0-30 focus:border-neutral-500 focus:shadow-D-X0-Y0-B6-S0-30 active:border-neutral-500 disabled:bg-neutral-100",
                          props.className,
                          {
                            "!border-red-800":
                              control.getFieldState(name).error,
                          },
                        )}
                        step={1}
                        allowNegativeValue={false}
                        allowDecimals={false}
                        onValueChange={(value) => {
                          field.onChange(
                            (value ?? "").replace(LEADING_ZEROS_REGEX, ""),
                          );
                          onChangeCurrency?.(value);
                        }}
                        onBlur={(e) => {
                          if (onBlur) {
                            onBlur(e);
                          }
                        }}
                      />
                    ) : (
                      <Input
                        autoComplete="off"
                        {...field}
                        {...props}
                        value={
                          (field.value as
                            | string
                            | number
                            | readonly string[]
                            | undefined) ?? ""
                        }
                        readOnly={isNavigating || readOnlyForm}
                        className={cn(
                          "pr-7 disabled:opacity-100 read-only:dark:bg-neutral-dark-400",
                          props.className,
                          {
                            "!border-red-800":
                              control.getFieldState(name).error,
                          },
                        )}
                        onChange={(event) => {
                          if (onChange) {
                            onChange(event);
                            return;
                          }
                          const rawValue = event.target.value;
                          const trimmedValue = rawValue.replace(
                            LEADING_ZEROS_REGEX,
                            "",
                          );
                          let newValue: string | number = rawValue;
                          if (isNumberInput) {
                            if (!isDecimal) {
                              newValue =
                                trimmedValue === "" ? "" : +trimmedValue;
                            } else {
                              const isZeroAllowed = Number(props.min ?? 0) <= 0;
                              const isValidNumber =
                                +event.target.value !== 0 || isZeroAllowed;
                              newValue =
                                event.target.value && isValidNumber
                                  ? +event.target.value
                                  : rawValue;
                            }
                          }
                          field.onChange(newValue);
                        }}
                        onBeforeInput={(e) => {
                          props.onBeforeInput?.(e);
                          const event = e as unknown as InputEvent;

                          if (isDecimal) return;

                          if (
                            !event.data ||
                            !INVALID_NUMERIC_CHARACTERS.test(event.data)
                          )
                            return;
                          e.preventDefault();
                        }}
                        onBlur={(e) => {
                          handleFocusRelatedTarget(e);
                          if (
                            typeof field.value === "string" &&
                            field.value.trim() !== e.target.value
                          ) {
                            field.onChange(field.value.trim());
                          }
                          if (!onBlur) return;
                          onBlur(e);
                        }}
                        handleNumberValue={field.onChange}
                      />
                    )}
                  </FormControl>
                  <InputActionsForm
                    className={cn(
                      isNumberInput ? "right-8" : "right-1",
                      inputActionsClassname,
                    )}
                    field={field}
                    showCurrencyUnit={showCurrencyUnit}
                    showClearIcon={
                      showClearIcon && !readOnlyForm && !props.disabled
                    }
                    showCopyIcon={showCopyIcon}
                    showUndoIcon={
                      showUndoIcon && !readOnlyForm && !props.disabled
                    }
                    value={value}
                  />
                </div>
                {unit && (
                  <span className="whitespace-nowrap text-base text-neutral-800">
                    {unit}
                  </span>
                )}
              </div>
              <FormMessage />
              {bottomDesc && (
                <FormDescription className="text-base text-neutral-400">
                  {bottomDesc}
                </FormDescription>
              )}
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default InputForm;

export const handleFocusRelatedTarget = (
  e: React.FocusEvent<HTMLInputElement>,
) => {
  const element = e.relatedTarget as HTMLElement | null;
  if (!element) return;

  const actions: Record<string, () => void> = {
    INPUT: () => {
      element.focus();
    },
    BUTTON: () => {
      element.focus();
    },
    A: () => {
      element.focus();
    },
    TEXTAREA: () => {
      element.click();
    },
  };

  actions[element.tagName]?.();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getInsertedText = (nativeEvent: unknown): string | undefined => {
  if (!isRecord(nativeEvent)) return undefined;

  const data = nativeEvent.data;
  if (typeof data === "string") return data;

  const key = nativeEvent.key;
  if (typeof key === "string") return key;

  return undefined;
};

export const onlyAllowDigits = (e: React.FormEvent<HTMLInputElement>) => {
  const data = getInsertedText(e.nativeEvent);

  if (!data) return;

  if (/^\d+$/.test(data)) return;

  e.preventDefault();
};

export const handleNumberInputBlur =
  <TFieldValues extends FieldValues>(
    name: Path<TFieldValues>,
    setValue: UseFormSetValue<TFieldValues>,
    min: number,
    max: number,
  ) =>
  (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    if (isNaN(value) || value < min) {
      setValue(name, min as PathValue<TFieldValues, typeof name>, {
        shouldValidate: true,
      });
    } else if (value > max) {
      setValue(name, max as PathValue<TFieldValues, typeof name>, {
        shouldValidate: true,
      });
    }
  };

export const onlyIntegersAreAllowed = (
  e: React.FormEvent<HTMLInputElement>,
) => {
  const value = getInsertedText(e.nativeEvent);
  if (
    value === "-" ||
    (/^-?\d+$/.test(value ?? "") && !(value ?? "").includes("--"))
  ) {
    return;
  }
  e.preventDefault();
};
