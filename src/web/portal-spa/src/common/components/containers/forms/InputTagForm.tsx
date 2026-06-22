"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import InputActionsForm from "@common/components/containers/forms/InputActionsForm";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { X } from "@common/components/icons";

import {
  type ControllerRenderProps,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import React, { useRef, useState } from "react";
import type { InputFormProps } from "@common/components/containers/forms/InputForm";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const InputTagForm = ({
  label,
  name,
  className,
  required,
  showCopyIcon = false,
  showClearIcon = false,
  readOnly = false,
  showUndoIcon = false,
  ...props
}: InputFormProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <InputTagField
          field={field}
          {...props}
          name={name}
          label={label}
          required={required}
          className={className}
          showCopyIcon={showCopyIcon}
          showClearIcon={showClearIcon}
          readOnly={readOnly}
          showUndoIcon={showUndoIcon}
        />
      )}
    />
  );
};

type InputTagFieldProps = {
  field: ControllerRenderProps<FieldValues, string>;
  defaultClearValue?: string[];
} & InputFormProps;

const InputTagField = ({
  field,
  label,
  name,
  className,
  required,
  showCopyIcon,
  showClearIcon,
  readOnly,
  showUndoIcon,
  defaultClearValue = [],
  ...props
}: InputTagFieldProps) => {
  const { control, clearErrors, setError, formState } = useFormContext();
  const { t } = useLayoutStore((state) => state);
  const [inputValue, setInputValue] = useState("");
  const measureRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkOverflow = (text: string): boolean => {
    if (!containerRef.current || !measureRef.current) return false;
    const container = containerRef.current;
    const measure = measureRef.current;
    measure.textContent = text;
    const rightEdge = measure.offsetLeft + measure.offsetWidth;
    return rightEdge > container.offsetWidth - 32;
  };

  const tags: string[] = Array.isArray(field.value)
    ? (field.value as string[])
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    if (tags.some((t) => t === trimmed)) {
      setError(name, {
        type: "manual",
        message: t("tag.duplicate_tag"),
      });
      return;
    }

    clearErrors(name);

    const newTags = [...tags, tag];
    field.onChange(newTags.map((t) => t));
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    field.onChange(newTags.length === 0 ? "" : newTags.map((t) => t));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keyHandlers: Record<string, () => void> = {
      Enter: () => {
        e.preventDefault();
        addTag(inputValue);
      },
      Backspace: () => {
        if (!inputValue && tags.length > 0) {
          const deleteTag = tags.at(-1);
          if (deleteTag) removeTag(deleteTag);
        }
      },
    };
    const handler = keyHandlers[e.key];
    if (!handler) return;

    handler();
  };

  return (
    <FormItem className="flex flex-col gap-1">
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-primary-100"> *</span>}
        </FormLabel>
      )}
      <div className="group/input-form relative">
        <FormControl>
          <label htmlFor={name} className="block">
            <div
              ref={containerRef}
              className={cn(
                "flex w-full flex-wrap items-start rounded bg-neutral-0 pl-1 pr-8",
                "relative h-9",
                "text-base",
                "border border-neutral-200 hover:border-neutral-400 focus:border-neutral-500 active:border-neutral-500",
                "file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-neutral-300 focus-visible:outline-none dark:border-neutral-300",
                "hover:shadow-D-X0-Y0-B6-S0-30 focus:shadow-D-X0-Y0-B6-S0-30",
                "resize-y overflow-y-auto",
                {
                  "h-fit min-h-9 pb-[0.1875rem]": tags.length > 0,
                  "pointer-events-none cursor-not-allowed border-none bg-neutral-100 opacity-100":
                    props.disabled,
                },
                "scrollbar max-h-36 cursor-text overflow-y-auto overflow-x-hidden",
                className,
              )}
            >
              {tags.map((tag, i) => {
                const isOverflow = checkOverflow(tag.trim());
                const tagBtn = (
                  <button
                    key={tag}
                    onClick={() => {
                      removeTag(tag);
                    }}
                    className={cn(
                      "group mr-1 mt-[0.1875rem] flex h-7 items-center gap-1 py-1 !pl-2 pr-1",
                      "rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700",
                      { "mr-0": i === tags.length - 1 },
                    )}
                  >
                    <span
                      className={cn("truncate", {
                        "max-w-full": !isOverflow,
                      })}
                      style={
                        isOverflow && containerRef.current
                          ? {
                              maxWidth: `${containerRef.current.clientWidth - 80}px`,
                            }
                          : undefined
                      }
                    >
                      {tag}
                    </span>
                    <div className="group-hover:text-primary-200">
                      <X size={16} />
                    </div>
                  </button>
                );

                return isOverflow ? (
                  <TooltipContainer
                    className="max-w-96"
                    key={tag}
                    content={tag}
                  >
                    {tagBtn}
                  </TooltipContainer>
                ) : (
                  tagBtn
                );
              })}

              <input
                id={name}
                autoComplete="off"
                {...field}
                {...props}
                value={inputValue}
                className={cn(
                  "min-w-[60px] border-none !p-0 !pl-2 disabled:opacity-100 read-only:dark:bg-neutral-dark-400",
                  "mt-[0.1875rem] h-7 flex-1",
                  {
                    "!border-red-800": control.getFieldState(name).error,
                  },
                )}
                placeholder={
                  tags.length > 0 || props.disabled ? "" : t("tag.placeholder")
                }
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(value);
                  if (!value) {
                    field.onChange(e);
                    return;
                  }
                  if (formState.errors[name]) {
                    clearErrors(name);
                  }
                }}
              />

              <button
                ref={measureRef}
                className="invisible absolute left-0 top-0 -z-10 h-7 whitespace-nowrap px-2"
              />
            </div>
          </label>
        </FormControl>
        <InputActionsForm
          className={"right-1"}
          field={field}
          showClearIcon={showClearIcon && !readOnly && !props.disabled}
          showCopyIcon={showCopyIcon}
          showUndoIcon={showUndoIcon && !readOnly && !props.disabled}
          defaultClearValue={defaultClearValue}
        />
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default InputTagForm;
