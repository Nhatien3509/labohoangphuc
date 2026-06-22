"use client";

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
import { Calendar } from "@common/components/ui/calendar";

import { Calendar as CalendarIcon } from "@common/components/icons";

import { type Locale, format } from "date-fns";
import { type ReactNode, useState } from "react";
import { enUS, vi } from "date-fns/locale";
import { type Matcher } from "react-day-picker";
import { cn } from "@common/lib/core/utils";
import { useFormContext } from "react-hook-form";
import { useParams } from "next/navigation";

type DatePickerFormProps = {
  label?: ReactNode;
  name: string;
  required?: boolean;
  desc?: string;
  placeholder?: string;
  disabled?: boolean;
  isSingleMode?: boolean;
  disabledMatcher?: Matcher | Matcher[];
};

const locales: Record<string, Locale> = {
  en: enUS,
  vi: vi,
};

export function DatePickerForm({
  label = "",
  name,
  required = false,
  desc,
  placeholder = "",
  disabled = false,
  isSingleMode = true,
  disabledMatcher = { before: new Date() },
}: Readonly<DatePickerFormProps>) {
  const { control } = useFormContext();
  const { locale } = useParams<{ locale: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date | undefined>(undefined);

  const renderFieldValue = (value: unknown) => {
    if (!value) {
      return <span className="text-neutral-400">{placeholder}</span>;
    }

    if (value instanceof Date) {
      return format(value, "dd/MM/yyyy");
    }

    return <span>Invalid format</span>;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1 aria-selected:bg-red-50">
          {label && (
            <FormLabel className="flex gap-1 space-x-1">
              {label} {required && <span className="text-primary-100"> *</span>}
            </FormLabel>
          )}

          <Popover modal open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild disabled={disabled}>
              <FormControl>
                <Button
                  variant={"tertiary"}
                  className={cn(
                    "bg-neutral-0 px-2 text-left font-normal",
                    "hover:border-neutral-500 hover:bg-neutral-0 hover:!shadow-D-X0-Y0-B6-S0-30",
                    "border-neutral-200 aria-expanded:border-neutral-500 aria-expanded:!shadow-D-X0-Y0-B6-S0-30",
                    "focus-visible:border-neutral-500 focus-visible:!shadow-D-X0-Y0-B6-S0-30",
                    !field.value && "text-muted-foreground",
                    disabled &&
                      "pointer-events-none border-none !bg-neutral-100",
                    {
                      "!border-red-800": control.getFieldState(name).error,
                    },
                  )}
                >
                  {renderFieldValue(field)}
                  <CalendarIcon className="ml-auto" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent align="start" className="my-1 w-auto p-2.5">
              <Calendar
                disabled={disabledMatcher}
                locale={locales[locale]}
                mode="single"
                selected={field.value as Date | undefined}
                month={displayMonth ?? (field.value as Date | undefined)}
                onMonthChange={setDisplayMonth}
                classNames={{
                  nav: "hidden",
                  weekday:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] mx-1",
                  day: `h-9 w-9 text-center text-base p-0 relative mx-1 hover:rounded-sm  ${isSingleMode ? "" : "hover:bg-primary-50"}`,
                  day_button: `h-full w-full p-0 text-md font-normal aria-selected:opacity-100 ${isSingleMode ? "hover:font-semibold" : "!hover:font-normal"}`,
                  month: "!w-auto",
                  selected:
                    "bg-primary-50 !text-primary-100 border border-primary-100 hover:!text-neutral-800 hover:text-primary-foreground focus:bg-primary-100 focus:text-primary-foreground date-selected rounded-[0.25rem]",
                }}
                onSelect={(date) => {
                  if (!disabled) {
                    field.onChange(date);
                    setDisplayMonth(date);
                    setIsOpen(false);
                  }
                }}
              />
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
