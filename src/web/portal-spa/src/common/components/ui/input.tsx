import CopyContainer from "@common/components/containers/CopyContainer";
import { Label } from "@common/components/ui/label";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { Decrease, Increase } from "@common/components/icons";

import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@common/lib/core/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  showCopyIcon?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  isSecret?: boolean;
  handleNumberValue?: (value: number) => void;
  label?: ReactNode;
  desc?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon,
      rightIcon,
      disabled = false,
      showCopyIcon = false,
      readOnly,
      fullWidth = true,
      isSecret = false,
      autoComplete = "off",
      handleNumberValue,
      label,
      desc,
      value,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const checkOverflow = () => {
      if (!inputRef.current) return;
      const { scrollWidth, clientWidth } = inputRef.current;
      setIsOverflowed(scrollWidth > clientWidth);
    };

    useEffect(() => {
      checkOverflow();
      window.addEventListener("resize", checkOverflow);
      return () => {
        window.removeEventListener("resize", checkOverflow);
      };
    }, [value]);

    const numberValue = Number(value ?? 0);
    const stepValue = Number(props.step ?? 1);
    const minValue = Number(props.min ?? -Infinity);
    const maxValue = Number(props.max ?? Infinity);
    const nearestUpperBoundValue =
      Math.ceil(numberValue / stepValue) * stepValue;
    const nearestLowerBoundValue =
      Math.floor(numberValue / stepValue) * stepValue;

    return (
      <div className="grid w-full items-center gap-1">
        {label && <Label htmlFor={props.name}>{label}</Label>}
        {desc && <p className="text-base text-neutral-400">{desc}</p>}
        <div
          className={
            fullWidth
              ? "relative flex w-full items-end"
              : "relative flex items-end"
          }
        >
          {leftIcon && (
            <div className="absolute left-1.5 -translate-y-1/2 transform">
              {leftIcon}
            </div>
          )}

          <TooltipContainer
            isPreventDefault={false}
            content={
              !isSecret && isOverflowed && (!isFocused || readOnly || disabled)
                ? value?.toString()
                : null
            }
            className="max-w-80"
          >
            <input
              ref={(node) => {
                inputRef.current = node;
                if (!ref) return;
                if (typeof ref === "function") {
                  ref(node);
                  return;
                }
                ref.current = node;
              }}
              autoComplete={autoComplete}
              disabled={disabled}
              readOnly={readOnly}
              type={type}
              className={cn(
                "flex h-[30px] w-full overflow-hidden text-ellipsis rounded-sm border border-neutral-200 px-3 py-[0.25rem] text-base file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-neutral-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-300 dark:bg-neutral-dark-50",
                "read-only:border-none read-only:bg-neutral-100 read-only:!shadow-none hover:border-neutral-400 hover:shadow-D-X0-Y0-B6-S0-30 focus:border-neutral-500 focus:shadow-D-X0-Y0-B6-S0-30 active:border-neutral-500 disabled:bg-neutral-100",
                leftIcon ? "pl-[2rem]" : "",
                rightIcon ? "pr-[2rem]" : "",
                className,
              )}
              {...props}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              value={value}
            />
          </TooltipContainer>

          <div
            className={cn(
              "absolute right-2.5 top-1/2 flex h-6 -translate-y-1/2 transform items-center justify-center gap-0.5",
            )}
          >
            {type === "number" && !disabled && !readOnly && (
              <div className="flex h-6 w-6 flex-col items-end">
                <button
                  onClick={() => {
                    handleNumberValue?.(nearestLowerBoundValue + stepValue);
                  }}
                  className="group/increase rounded-t-sm text-neutral-700 hover:text-primary-200 focus-visible:text-primary-200 active:bg-neutral-100 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15 disabled:pointer-events-none"
                  disabled={numberValue >= maxValue}
                >
                  <Increase className="group-disabled/increase:text-neutral-300" />
                </button>
                <button
                  onClick={() => {
                    handleNumberValue?.(nearestUpperBoundValue - stepValue);
                  }}
                  className="group/decrease rounded-b-sm text-neutral-700 hover:text-primary-200 focus-visible:text-primary-200 active:bg-neutral-100 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15 disabled:pointer-events-none"
                  disabled={numberValue <= minValue}
                >
                  <Decrease className="group-disabled/decrease:text-neutral-300" />
                </button>
              </div>
            )}
            {rightIcon && <div>{rightIcon}</div>}
            {showCopyIcon && (
              <div>
                <CopyContainer size={20} message={value as string} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
