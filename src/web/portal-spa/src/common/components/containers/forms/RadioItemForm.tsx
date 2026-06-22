import { FormControl, FormItem, FormLabel } from "@common/components/ui/form";
import {
  RadioGroupItem,
  type RadioItemProps,
} from "@common/components/ui/radio-group";
import { cn } from "@common/lib/core/utils";

import React, { type ReactNode } from "react";

type RadioItemFormProps = RadioItemProps & {
  label?: ReactNode;
};

function RadioItemForm({
  label,
  className,
  ...props
}: Readonly<RadioItemFormProps>) {
  return (
    <FormItem className={cn("flex items-center", className)}>
      <FormControl>
        <RadioGroupItem {...props} />
      </FormControl>
      {label && <FormLabel className="ml-2 text-base">{label}</FormLabel>}
    </FormItem>
  );
}

export default RadioItemForm;
