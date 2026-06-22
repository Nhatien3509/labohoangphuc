import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loading } from "@common/components/icons";

import { cloneElement, forwardRef, isValidElement } from "react";

import { cn } from "@common/lib/core/utils";

const buttonVariants = cva(
  "align-bottom active:shadow-I-X2-Y2-B4-S0-25 focus-visible:outline-none focus-visible:shadow-D-X0-Y0-B6-S0-30 dark:focus-visible:shadow-D-X0-Y0-B6-S0-Neutral-50 inline-flex items-center justify-center gap-2 whitespace-nowrap text-base ring-offset-background transition-colors disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-300",
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary-100 text-neutral-0 font-medium",
          "hover:bg-primary-200",
          "active:bg-primary-200",
          "dark:disabled:bg-neutral-dark-50 dark:disabled:text-neutral-dark-400",
        ),
        ghost: cn(
          "bg-neutral-100 font-medium dark:bg-neutral-dark-50 text-neutral-700 dark:text-neutral-dark-900",
          "hover:bg-neutral-200 ",
          "disabled:bg-neutral-100",
          "dark:hover:bg-neutral-dark-100",
          "disabled:text-neutral-dark-400",
        ),
        secondary: cn(
          "border border-primary-100 bg-transparent text-primary-100 font-medium",
          "hover:bg-primary-50 hover:text-primary-200 hover:border-primary-200",
          "disabled:border-none",
          "dark:text-neutral-dark-900 dark:bg-neutral-dark-50  dark:border-neutral-dark-900",
          "dark:hover:bg-neutral-dark-100 dark:hover:text-neutral-dark-800 dark:hover:border-neutral-dark-800",
          "dark:active:border-primary-200",
          "dark:disabled:border-solid dark:disabled:bg-neutral-dark-50 dark:disabled:border-neutral-dark-200 dark:disabled:text-neutral-dark-400",
        ),
        tertiary: cn(
          "border border-neutral-400 font-medium bg-transparent text-neutral-700 dark:border-neutral-dark-900 dark:text-neutral-dark-900",
          "hover:bg-neutral-100 active:bg-neutral-100",
          "disabled:border-neutral-200 disabled:bg-transparent ",
          "focus-visible:bg-neutral-0 ",
          "dark:hover:bg-transparent dark:hover:border-primary-200 dark:hover:text-primary-200",
          "dark:focus-visible:bg-transparent",
          "dark:disabled:border-neutral-dark-900 dark:disabled:text-neutral-dark-400",
        ),
        text: cn(
          "bg-transparent text-neutral-700",
          "hover:text-primary-200 active:text-primary-200",
          "disabled:text-neutral-200 disabled:bg-transparent",
          "dark:hover:text-primary-200",
          "active:shadow-none",
        ),
        icon: cn(
          "bg-transparent text-neutral-700",
          "hover:text-primary-200 active:text-primary-200",
          "disabled:text-neutral-200 disabled:bg-transparent",
          "dark:hover:text-primary-200",
          "active:shadow-none !w-fit !h-fit !p-0 focus-visible:shadow-none focus-visible focus-visible:rounded",
        ),
      },
      size: {
        default: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-md px-8",
      },
      shape: {
        default: "rounded-sm",
        round: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      children,
      asChild = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const renderIcon = (icon: React.ReactNode) => {
      if (!isValidElement(icon)) return null;

      const typedIcon = icon as React.ReactElement<{ size?: number }>;

      const finalIcon = isLoading ? (
        <Loading className="animate-spin" />
      ) : (
        cloneElement(typedIcon, { size: typedIcon.props.size ?? 18 })
      );

      return finalIcon;
    };

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, className }))}
        {...props}
      >
        <>
          {renderIcon(leftIcon)}
          {children && <Slottable>{children}</Slottable>}
          {renderIcon(rightIcon)}
        </>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
