import { FormField } from "@common/components/ui/form";
import SwitchContainer from "@common/components/containers/SwitchContainer";

import { type ReactNode } from "react";
import { type SwitchProps } from "@common/components/ui/switch";
import { useFormContext } from "react-hook-form";

type SwitchFormProps = SwitchProps & {
  name: string;
  label?: ReactNode;
  isAllowedAction?: boolean;
  falseValue?: boolean | null;
  onCheckedChange?: (checked: boolean) => void;
};

export default function SwitchForm({
  name,
  label,
  disabled,
  isAllowedAction = true,
  falseValue = false,
  onCheckedChange,
  ...props
}: Readonly<SwitchFormProps>) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <SwitchContainer
          label={label}
          checked={!!field.value}
          disabled={disabled}
          isAllowedAction={isAllowedAction}
          onCheckedChange={(checked) => {
            field.onChange(checked ? true : falseValue);
            onCheckedChange?.(checked);
          }}
          {...props}
        />
      )}
    />
  );
}
