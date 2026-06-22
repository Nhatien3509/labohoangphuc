import {
  Controller,
  type ControllerProps,
  type FieldError,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";

import type * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { Label } from "@common/components/ui/label";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@/common/components/layout/providers/LayoutStoreProvider";

const Form = <TFieldValues extends FieldValues>({
  children,
  ...props
}: UseFormReturn<TFieldValues> & { children: React.ReactNode }) => {
  const currentProjectId = useLayoutStore((state) => state.currentProject?.id);

  React.useEffect(() => {
    if (!currentProjectId) return;

    props.reset();
  }, [currentProjectId, props.reset]);

  return <FormProvider {...props}>{children}</FormProvider>;
};

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type NestedError = Record<string, FieldError>;

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  const name = React.useMemo(() => ({ name: props.name }), [props.name]);

  return (
    <FormFieldContext.Provider value={name}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

function getErrorMessage(error?: FieldError | NestedError) {
  if (!error || typeof error !== "object") return;

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  for (const key in error) {
    const nestedError = (error as NestedError)[key];
    if (nestedError?.message) {
      return nestedError.message;
    }
  }
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  const memoId = React.useMemo(() => ({ id }), [id]);

  return (
    <FormItemContext.Provider value={memoId}>
      <div ref={ref} className={cn(className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ ...props }, ref) => {
  const { formItemId } = useFormField();

  return <Label ref={ref} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      aria-invalid={!!error}
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      className={cn("text-base text-muted-foreground", className)}
      id={formDescriptionId}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = getErrorMessage(error) ?? children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn("text-base font-medium text-red-800", className)}
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
