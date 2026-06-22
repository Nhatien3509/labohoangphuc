import { Checkbox, type CheckboxProps } from "@common/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { type ReactNode } from "react";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type CheckboxFormProps = {
  label?: ReactNode;
  name: string;
  desc?: ReactNode;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  disabled?: boolean;
  required?: boolean;
  rightIcon?: React.ReactNode;
  dependentField?: string[];
  isHideError?: boolean;
  isAllowedAction?: boolean;
  formItemClassName?: string;
};

export default function CheckboxForm({
  name,
  label,
  disabled = false,
  desc,
  required,
  rightIcon,
  dependentField,
  isHideError = false,
  onCheckedChange,
  isAllowedAction = true,
  formItemClassName,
  ...props
}: Readonly<CheckboxFormProps & CheckboxProps>) {
  const { t, isNavigating } = useLayoutStore((state) => ({
    t: state.t,
    isNavigating: state.isNavigating,
  }));
  const { control, resetField } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col">
          <FormItem
            className={cn(
              "flex flex-row items-center space-x-2",
              formItemClassName,
            )}
          >
            <FormControl>
              {!isAllowedAction ? (
                <TooltipContainer
                  content={t("common.allowed_actions.no_perform")}
                >
                  <Checkbox disabled {...props} />
                </TooltipContainer>
              ) : (
                <Checkbox
                  className={cn(
                    "focus-visible:border-neutral-500 focus-visible:data-[state=checked]:bg-primary-200",
                    props.className,
                  )}
                  {...field}
                  disabled={disabled || isNavigating}
                  onCheckedChange={(e) => {
                    if (dependentField?.filter((i) => i).length) {
                      dependentField.forEach((i) => {
                        resetField(i, { keepError: true });
                      });
                    }
                    field.onChange(e);
                    onCheckedChange?.(e);
                  }}
                  error={
                    isHideError
                      ? false
                      : Boolean(control.getFieldState(name).error)
                  }
                  {...props}
                />
              )}
            </FormControl>

            <div className={"inline-flex items-center"}>
              <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label} {required && <span className="text-red-500"> *</span>}
              </FormLabel>
              &nbsp;
              {rightIcon}
            </div>
          </FormItem>
          {!isHideError && <FormMessage />}
          {desc && (
            <FormDescription className="text-base text-neutral-400">
              {desc}
            </FormDescription>
          )}
        </div>
      )}
    />
  );
}
