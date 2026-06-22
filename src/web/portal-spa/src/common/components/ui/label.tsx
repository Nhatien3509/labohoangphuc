"use client";

import * as LabelPrimitive from "@radix-ui/react-label";

import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@common/lib/core/utils";

const labelVariants = cva(
  "inline-block text-base peer-disabled:cursor-not-allowed peer-disabled:opacity-70 h-fit",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
