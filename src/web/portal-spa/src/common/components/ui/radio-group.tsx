"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type VariantProps, cva } from "class-variance-authority";
import { Radio } from "@common/components/icons";

import * as React from "react";
import { cn } from "@common/lib/core/utils";

const radioGroupItemVariants = cva(
  `aspect-square rounded-full border border-neutral-200 bg-neutral-0 cursor-pointer
  hover:border-neutral-400 active:border-primary-100 focus:border-[0.09375rem]
  data-[state=checked]:border-primary-100 data-[state=checked]:bg-neutral-50 data-[state=checked]:text-primary-100
  hover:data-[state=checked]:border-primary-200 hover:data-[state=checked]:text-primary-200
  focus-visible:data-[state=checked]:border-primary-200 focus-visible:data-[state=checked]:text-primary-200
  disabled:cursor-not-allowed disabled:!border-neutral-200 disabled:!bg-neutral-100
  disabled:data-[state=checked]:!border-neutral-400 disabled:data-[state=checked]:!text-neutral-400`,
  {
    variants: {
      size: {
        sm: "h-4 w-4 ",
        default: "h-5 w-5 border-neutral-300 hover:border-neutral-500",
        lg: "h-6 w-6 border-neutral-300 hover:border-neutral-500",
      },
      error: {
        true: cn("!bg-primary-50 !border-primary-100 !text-primary-100"),
      },
    },
    defaultVariants: {
      size: "default",
      error: false,
    },
  },
);

export interface RadioItemProps
  extends
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const circleVariants: Record<"sm" | "lg" | "default", string> = {
  sm: "h-2.5 w-2.5",
  lg: "h-3.5 w-3.5",
  default: "h-3 w-3",
};

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioItemProps
>(({ className, error, size, ...props }, ref) => {
  const circleVariantsCn = circleVariants[size ?? "default"];

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ className, error, size }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Radio className={cn(circleVariantsCn, "fill-current text-current")} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
