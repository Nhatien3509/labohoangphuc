import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@common/components/ui/popover";
import { Button } from "@common/components/ui/button";
import DaySelect from "@common/components/containers/forms/DaySelect";

import { Calendar } from "@common/components/icons";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type MonthPickerFormProps = {
  label?: ReactNode;
  name: string;
  required?: boolean;
  desc?: string;
  disabled?: boolean;
  placeholder?: string;
  displayText?: (val: number[]) => string;
};

export function MonthPickerForm({
  label = "",
  name,
  required = false,
  desc,
  disabled = false,
  placeholder = "",
  displayText: displayTextProp,
}: Readonly<MonthPickerFormProps>) {
  const { t } = useLayoutStore((state) => state);
  const { control } = useFormContext();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const defaultDisplayText = (val: number[]) => {
    if (val.length === 31) return t("common.month_picker.all");
    return val.length > 0
      ? `${val.length} ` + t("common.month_picker.selected_dates")
      : t("common.month_picker.select");
  };

  const displayText = displayTextProp ?? defaultDisplayText;

  const options = [
    { label: "all", value: "all" },
    { label: "select", value: "select" },
  ];

  const handleSelectOption = (optionValue: string) => {
    setSelectedOption(optionValue);
    setSelectedDays(() => {
      if (optionValue === "all") {
        return Array.from({ length: 31 }, (_, i) => i + 1);
      }
      return [];
    });
  };

  useEffect(() => {
    if (selectedDays.length === 31) {
      setSelectedOption("all");
    } else if (selectedDays.length > 0) {
      setSelectedOption("select");
    } else {
      setSelectedOption("");
    }
  }, [selectedDays.length]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-col space-y-1",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {label && (
            <FormLabel className="flex space-x-1">
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover modal open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild disabled={disabled}>
              <FormControl>
                <Button
                  variant={"tertiary"}
                  className={cn(
                    "px-2 text-left font-normal",
                    (field.value as number[]).length === 0 &&
                      "text-muted-foreground",
                  )}
                  onClick={() => {
                    setIsOpen(true);
                  }}
                >
                  {(field.value as number[]).length > 0
                    ? displayText(field.value as number[])
                    : placeholder}
                  <Calendar className="ml-auto" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="my-1 w-[21.375rem] space-y-3 p-6 opacity-100"
            >
              <div className="flex justify-between">
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <Button
                      key={option.value}
                      className="h-8 px-3 text-base"
                      variant={
                        selectedOption === option.value
                          ? "secondary"
                          : "tertiary"
                      }
                      onClick={() => {
                        handleSelectOption(option.value);
                      }}
                    >
                      {t(`common.month_picker.${option.value}`)}
                    </Button>
                  ))}
                </div>
                {selectedDays.length > 0 && (
                  <Button
                    className="h-8 px-3 text-base font-medium text-neutral-700"
                    variant="text"
                    onClick={() => {
                      handleSelectOption("clear");
                    }}
                  >
                    {t("common.month_picker.clear")}
                  </Button>
                )}
              </div>

              <div className="mx-2 mb-2 border-b border-neutral-100">
                <span className="text-base leading-8">
                  {t("common.month_picker.selected_dates")}
                </span>
              </div>

              <DaySelect
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
              />
              <div className="flex flex-row items-end justify-end gap-3 px-2">
                <Button
                  className="text-neutral-800"
                  variant={"text"}
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedDays([]);
                    field.onChange([]);
                  }}
                >
                  {t("common.month_picker.cancel")}
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    field.onChange(selectedDays);
                    setIsOpen(false);
                  }}
                >
                  {t("common.month_picker.apply")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {desc && (
            <FormDescription className="text-base text-neutral-400">
              {desc}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
