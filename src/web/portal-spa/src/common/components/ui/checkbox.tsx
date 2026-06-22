"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type VariantProps, cva } from "class-variance-authority";
import { DividerHorizontalIcon } from "@radix-ui/react-icons";

import { Check } from "@common/components/icons";

import * as React from "react";
import { cn } from "@common/lib/core/utils";

const checkboxVariants = cva(
  `peer h-5 w-5 shrink-0 rounded-[0.125rem] border border-neutral-200 bg-neutral-0
    dark:border-neutral-dark-600 dark:bg-neutral-dark-0
    data-[state=indeterminate]:border-[#1379F0] data-[state=indeterminate]:bg-blue-50 data-[state=indeterminate]:text-[#1379F0]
    data-[state=checked]:border-[#1379F0] data-[state=checked]:bg-[#1379F0] data-[state=checked]:text-neutral-0
    dark:data-[state=indeterminate]:border-[#1379F0] dark:data-[state=indeterminate]:bg-neutral-dark-0 dark:data-[state=indeterminate]:text-[#1379F0]
    dark:data-[state=checked]:border-[#1379F0] dark:data-[state=checked]:bg-[#1379F0] dark:data-[state=checked]:text-neutral-0
    hover:border-neutral-400 hover:bg-neutral-0
    hover:data-[state=indeterminate]:border-[#1379F0] hover:data-[state=indeterminate]:bg-blue-50 hover:data-[state=indeterminate]:text-[#1379F0]
    hover:data-[state=checked]:border-[#1379F0] hover:data-[state=checked]:bg-[#1379F0]
    dark:hover:border-neutral-dark-800 dark:hover:bg-neutral-dark-50
    dark:hover:data-[state=indeterminate]:border-[#1379F0] dark:hover:data-[state=indeterminate]:bg-neutral-dark-0 hover:data-[state=indeterminate]:text-[#1379F0]
    dark:hover:data-[state=checked]:border-[#1379F0] dark:hover:data-[state=checked]:bg-[#1379F0]
    active:shadow-I-X0-Y0-B6-S0-30 dark:active:shadow-I-X0-Y0-B6-S0-25
    disabled:cursor-not-allowed disabled:active:shadow-none disabled:!border-neutral-200 disabled:!bg-neutral-100 disabled:!text-neutral-300
    disabled:data-[state=checked]:!border-neutral-100
    dark:disabled:!border-neutral-dark-300 dark:disabled:!bg-neutral-dark-100 dark:disabled:!text-neutral-dark-300
    dark:disabled:data-[state=checked]:!border-neutral-dark-100`,
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
      },
      error: {
        true: cn(
          "!bg-red-100 !border-red-900 !text-red-900 dark:!bg-neutral-dark-0",
        ),
      },
    },
    defaultVariants: {
      size: "default",
      error: false,
    },
  },
);

export interface CheckboxProps
  extends
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ className, error, size }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {props.checked === "indeterminate" && (
        <DividerHorizontalIcon
          height={18}
          stroke="currentColor"
          strokeLinecap="square"
          strokeLinejoin="inherit"
          strokeWidth={"2"}
          width={8}
        />
      )}
      {props.checked !== "indeterminate" && (
        <Check height={18} strokeWidth={"2"} width={16} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
