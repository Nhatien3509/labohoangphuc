import * as React from "react";
import { Decrease, Increase } from "@common/components/icons";
import { cn } from "@common/lib/core/utils";

export interface SpinnerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
  onStepChange?: (newValue: number) => void;
}

const SpinnerInput = React.forwardRef<HTMLInputElement, SpinnerInputProps>(
  (
    {
      className,
      type,
      fullWidth = true,
      onStepChange,
      autoComplete = "off",
      ...props
    },
    ref,
  ) => {
    const handleStepChange = (isIncrement: boolean) => {
      const currentValue = props.value ? Number(props.value) : 0;
      const stepValue = props.step ? Number(props.step) : 1;
      const maxValue = typeof props.max === "number" ? props.max : Infinity;
      const minValue = typeof props.min === "number" ? props.min : -Infinity;

      const newValue = isIncrement
        ? Math.min(maxValue, currentValue + stepValue)
        : Math.max(minValue, currentValue - stepValue);

      onStepChange?.(newValue);
    };
    const numberValue = Number(props.value ?? 0);
    const minValue = Number(props.min ?? 0);
    const maxValue = Number(props.max ?? 0);

    return (
      <div
        className={
          fullWidth
            ? "relative flex w-full items-end"
            : "relative flex items-end"
        }
      >
        <div className="border-t-1 flex h-9 w-[4.625rem] flex-row gap-1 rounded-sm border p-1">
          <input
            ref={ref}
            autoComplete={autoComplete}
            type={type}
            className={cn(
              "flex h-full w-[2.375rem] cursor-not-allowed rounded-sm rounded-l-sm rounded-r-none text-base caret-transparent focus-visible:outline-none dark:border-neutral-300 dark:bg-neutral-dark-50",
              "hover:border-neutral-400 hover:shadow-D-X0-Y0-B6-S0-30 focus:border-neutral-500 focus:shadow-D-X0-Y0-B6-S0-30 active:border-neutral-500",
              className,
            )}
            {...props}
          />
          <div className="flex h-6 w-6 flex-col items-end">
            <button
              onClick={() => {
                handleStepChange(true);
              }}
              className="group/increase rounded-t-sm hover:text-primary-200 active:bg-neutral-100 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15 disabled:pointer-events-none"
              disabled={
                numberValue >= maxValue || !!props.disabled || props.readOnly
              }
            >
              <Increase className="text-neutral-700 hover:text-primary-200 group-disabled/increase:text-neutral-300" />
            </button>
            <button
              onClick={() => {
                handleStepChange(false);
              }}
              className="group/decrease rounded-b-sm hover:text-primary-200 active:bg-neutral-100 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15 disabled:pointer-events-none"
              disabled={
                numberValue <= minValue || !!props.disabled || props.readOnly
              }
            >
              <Decrease className="text-neutral-700 hover:text-primary-200 group-disabled/decrease:text-neutral-300" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
SpinnerInput.displayName = "Input";

export { SpinnerInput };
