import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import InputActionsForm from "@common/components/containers/forms/InputActionsForm";
import { Textarea } from "@common/components/ui/textarea";

import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormInputProps = {
  label?: ReactNode;
  name: string;
  desc?: ReactNode;
  readOnly?: boolean;
  value?: string;
  required?: boolean;
  showClearIcon?: boolean;
  showUndoIcon?: boolean;
  showCopyIcon?: boolean;
  disableTrim?: boolean;
} & TextareaProps;

export default function TextareaForm({
  label,
  name,
  desc,
  readOnly = false,
  required = false,
  showClearIcon = false,
  showUndoIcon = false,
  showCopyIcon = false,
  disableTrim = false,
  value = "",
  onBlur,
  ...props
}: FormInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const isNavigating = useLayoutStore((state) => state.isNavigating);

  const { control } = useFormContext();
  const checkOverflow = () => {
    const el = textareaRef.current;
    if (!el) return;

    const isOverflowed = el.scrollHeight > el.clientHeight;
    setHasVerticalScroll(isOverflowed);
  };

  useEffect(() => {
    checkOverflow();

    const handleResize = () => {
      checkOverflow();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1">
          {label && (
            <FormLabel>
              {label} {required && <span className="text-red-500"> *</span>}
            </FormLabel>
          )}

          {desc && (
            <FormDescription className="text-base text-neutral-400">
              {desc}
            </FormDescription>
          )}

          <div className="group/input-form relative">
            <FormControl>
              <Textarea
                {...field}
                ref={(el) => {
                  field.ref(el); // giữ ref cho RHF
                  textareaRef.current = el; // ref riêng của bạn
                }}
                {...props}
                readOnly={readOnly || isNavigating}
                onInput={checkOverflow}
                className={cn(
                  "focus-visible:ring-none h-9 pr-8 dark:border-neutral-300 dark:bg-neutral-dark-50",
                  props.className,
                  {
                    "!border-red-800": control.getFieldState(name).error,
                  },
                )}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  if (typeof field.value === "string" && !disableTrim) {
                    field.onChange(field.value.trim());
                  }
                  if (!onBlur) return;
                  onBlur(e);
                }}
              />
            </FormControl>
            <InputActionsForm
              className={cn(
                hasVerticalScroll ? "right-3" : "right-1",
                "top-1.5 -translate-y-0",
              )}
              field={field}
              showClearIcon={showClearIcon && !readOnly && !props.disabled}
              showCopyIcon={showCopyIcon}
              showUndoIcon={showUndoIcon && !readOnly && !props.disabled}
              value={value}
            />
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
