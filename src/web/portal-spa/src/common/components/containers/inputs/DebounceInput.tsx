import { Input } from "@common/components/ui/input";
import TooltipContainer from "@common/components/containers/TooltipContainer";

import { ClearContent, Loupe20 } from "@common/components/icons";

import { forwardRef, useEffect, useRef, useState } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default forwardRef(function DebounceInput(
  {
    value: initialValue,
    onChange,
    debounce = 500,
    showSearchIcon = false,
    showClearIcon = false,
    className,
    ...props
  }: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
    showSearchIcon?: boolean;
    showClearIcon?: boolean;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">,
  ref: React.Ref<HTMLInputElement>,
) {
  const { t } = useLayoutStore((state) => state);

  const [value, setValue] = useState(initialValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      if (typeof value === "string") {
        const trimValue = value.trim();
        setValue(trimValue);
        onChange(trimValue);

        return;
      }

      onChange(value);
    }, debounce);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, debounce]);

  return (
    <div className="group/debounce-input relative w-full">
      <Input
        ref={ref}
        className={className}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        {...props}
      />
      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 transform items-center space-x-1">
        {showClearIcon && typeof value == "string" && !!value.length && (
          <TooltipContainer
            content={t("common.actions.delete")}
            disableHoverableContent={true}
          >
            <span className="hidden group-hover/debounce-input:block group-has-[input:focus]/debounce-input:block">
              <ClearContent
                onClick={() => {
                  setValue("");
                }}
              />
            </span>
          </TooltipContainer>
        )}

        {showSearchIcon && (
          <Loupe20
            size={20}
            className={`text-neutral-700 dark:text-neutral-dark-500`}
          />
        )}
      </div>
    </div>
  );
});
