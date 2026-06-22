import CopyContainer from "@common/components/containers/CopyContainer";
import Tooltip from "@common/components/containers/TooltipContainer";

import { ClearContent, Undo } from "@common/components/icons";

import { type ControllerRenderProps, type FieldValues } from "react-hook-form";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type InputActionsFormProps = {
  showCurrencyUnit?: boolean;
  showClearIcon?: boolean;
  showUndoIcon?: boolean;
  showCopyIcon?: boolean;
  field: ControllerRenderProps<FieldValues, string>;
  value?: string;
  className?: string;
  defaultClearValue?: string[] | string;
};

export default function InputActionsForm({
  field,
  showCurrencyUnit = false,
  showClearIcon = false,
  showUndoIcon = false,
  showCopyIcon = false,
  value = "",
  className = "",
  defaultClearValue = "",
}: Readonly<InputActionsFormProps>) {
  const { t } = useLayoutStore((state) => state);

  const handleReset = (field: ControllerRenderProps<FieldValues, string>) => {
    field.onChange(value);
  };

  const handleClear = (field: ControllerRenderProps<FieldValues, string>) => {
    field.onChange(defaultClearValue);
  };

  const canClear = field.value != null && field.value !== "";

  return (
    <div
      className={cn(
        "absolute top-1/2 flex h-6 -translate-y-1/2 transform items-center justify-center gap-0.5",
        className,
      )}
    >
      {showUndoIcon && field.value != value && (
        <div className="hidden group-hover/input-form:block group-has-[input:focus]/input-form:block group-has-[textarea:focus]/input-form:block">
          <Tooltip
            disableHoverableContent={true}
            content={t("common.actions.undo")}
          >
            <p>
              <Undo
                className="cursor-pointer hover:text-primary-200 active:text-primary-200"
                size={20}
                onClick={() => {
                  handleReset(field);
                }}
              />
            </p>
          </Tooltip>
        </div>
      )}
      {showClearIcon && canClear && (
        <div className="hidden group-hover/input-form:block group-has-[input:focus]/input-form:block group-has-[textarea:focus]/input-form:block">
          <Tooltip
            disableHoverableContent={true}
            content={t("common.actions.delete")}
          >
            <p>
              <ClearContent
                onClick={() => {
                  handleClear(field);
                }}
              />
            </p>
          </Tooltip>
        </div>
      )}
      {showCurrencyUnit && (
        <div className="flex w-5 items-center justify-center">&#8363;</div>
      )}
      {showCopyIcon && (
        <div>
          <CopyContainer size={20} message={field.value as string} />
        </div>
      )}
    </div>
  );
}
