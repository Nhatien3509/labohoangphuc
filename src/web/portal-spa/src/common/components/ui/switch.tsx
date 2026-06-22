"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@common/lib/core/utils";

const switchVariants = cva(
  "inline-flex shrink-0 h-5 w-10 relative cursor-pointer items-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background  data-[state=checked]:bg-[#1379F0] data-[state=checked]:hover:bg-[#1379F0] data-[state=unchecked]:bg-neutral-200 data-[state=unchecked]:hover:bg-neutral-300 disabled:cursor-not-allowed data-[state=unchecked]:disabled:bg-neutral-200 data-[state=checked]:disabled:bg-[#1379F0]/60",
  {
    variants: {
      size: {
        default: "h-5 w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface SwitchProps
  extends
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none absolute left-[0.104rem] top-[0.089rem] block size-[1.071rem] rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
