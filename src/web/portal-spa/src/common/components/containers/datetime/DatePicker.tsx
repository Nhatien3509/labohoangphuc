"use client";

import {
  Calendar,
  type MonthNavigationOptions,
} from "@common/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@common/components/ui/popover";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { TimePicker } from "@common/components/containers/datetime/TimePicker";

import { CaretDown, Check, ClearContent, X } from "@common/components/icons";

import { type ClassNames, type DateRange } from "react-day-picker";
import { type Locale, enUS, vi } from "date-fns/locale";
import React, {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { format, startOfDay, startOfToday, subDays } from "date-fns";
import {
  formatDatetime,
  getFirstAndLastDateOfThisMonth,
} from "@common/lib/helpers/datetime";
import { DATE_REGEX } from "@common/lib/core/const";
import { PopoverClose } from "@radix-ui/react-popover";
import TooltipContainer from "@common/components/containers/TooltipContainer";
import { cn } from "@common/lib/core/utils";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useParams } from "next/navigation";

const DATE_BUTTON_CLASS =
  "focus-visible focus-visible:rounded focus-visible:-m-1.5 focus-visible:p-1.5 text-base bg-transparent text-neutral-800 hover:text-primary-100 focus:shadow-none active:shadow-none disabled:text-neutral-300 dark:focus:shadow-none";

const locales: Record<string, Locale> = {
  en: enUS,
  vi: vi,
};

export interface DatePickerProps {
  className?: string;
  calendarClassName?: Partial<ClassNames>;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onChangeSelectedDate: (selectedDate: DateRange) => void;
  defaultSelectedDate: DateRange;
  showClear?: boolean;
  rightIcon?: ReactNode;
  triggerQuickSelect?: boolean;
  enableManualOpen?: boolean;
  toggleDatePicker?: boolean;
  hasRightBorderRadius?: boolean;
  onOpen?: (isOpen: boolean) => void;
  cancelBtn?: {
    leftIcon: ReactNode;
    title?: string;
    handleCancel?: () => void;
  };
  applyBtn?: {
    leftIcon: ReactNode;
    title?: string;
    handleApply?: () => void;
  };
  allowedStartDate?: Date;
  allowedEndDate?: Date;
  allowSeconds?: boolean;
  isShowLastMonth?: boolean;
  showDetailedCustomRange?: boolean;
  ignorePredefinedRange?: boolean;
  showDetailedValidateRange?: boolean;
  isShowMonthOptions?: boolean;
  monthNavigation?: MonthNavigationOptions;
}

export function DatePicker({
  className,
  calendarClassName,
  triggerProps,
  onChangeSelectedDate,
  defaultSelectedDate,
  showClear = true,
  rightIcon = <CaretDown />,
  cancelBtn = {
    leftIcon: <X size={18} />,
  },
  applyBtn = {
    leftIcon: <Check size={18} />,
  },
  triggerQuickSelect = true,
  enableManualOpen,
  toggleDatePicker = true,
  allowedStartDate,
  allowedEndDate,
  allowSeconds,
  hasRightBorderRadius = false,
  onOpen,
  isShowLastMonth,
  showDetailedCustomRange = true,
  ignorePredefinedRange = false,
  showDetailedValidateRange = false,
  isShowMonthOptions = true,
  monthNavigation = {
    previousDisabled: false,
    nextDisabled: false,
  },
}: Readonly<DatePickerProps>) {
  const { t } = useLayoutStore((state) => state);
  const { locale } = useParams<{ locale: string }>();

  const [selectedDate, setSelectedDate] =
    useState<DateRange>(defaultSelectedDate);
  const [tempDate, setTempDate] = useState<DateRange>(defaultSelectedDate);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState(
    formatDatetime(new Date(), "HH:mm:ss"),
  );
  const [tempPredefinedRange, setTempPredefinedRange] = useState("");
  const [predefinedRange, setPredefinedRange] = useState("");
  const [tempCustomRange, setTempCustomRange] = useState(true);
  const [customRange, setCustomRange] = useState(true);
  const [formatValidator, setFormatValidator] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const validateDateTimeFormat = showDetailedValidateRange
    ? "HH:mm dd/MM/yyyy"
    : "dd/MM/yyyy";

  useEffect(() => {
    setSelectedDate(defaultSelectedDate);
    setTempDate(defaultSelectedDate);
  }, [defaultSelectedDate]);

  const prevSelectedRangeRef = useRef<DateRange>(tempDate);

  const handleQuickSelect = (
    range: DateRange,
    predefinedRange: string,
    customRange: boolean,
  ) => {
    setTempDate(range);
    setTempPredefinedRange(predefinedRange);
    setTempCustomRange(customRange);
    setFormatValidator(false);
  };

  useEffect(() => {
    const setPredefinedRangeValues = (
      rangeKey: string,
      isCustomRange: boolean,
    ) => {
      const rangeValue = t(`common.date_picker.${rangeKey}`);
      setTempPredefinedRange(rangeValue);
      setPredefinedRange(rangeValue);
      setCustomRange(isCustomRange);
      setTempCustomRange(isCustomRange);
    };

    const isToday = (selectedDate: DateRange) =>
      selectedDate.from?.getTime() === startOfToday().getTime() &&
      selectedDate.to?.getTime() ===
        getFirstAndLastDateOfThisMonth().lastDate.getTime();

    const isPrevious7Days = (selectedDate: DateRange) => {
      const { firstDate, lastDate } = getPrevious7Days();
      return (
        selectedDate.from?.getTime() === firstDate.getTime() &&
        selectedDate.to?.getTime() === lastDate.getTime()
      );
    };

    const isThisMonth = (selectedDate: DateRange) => {
      const { firstDate, lastDate } = getFirstAndLastDateOfThisMonth();
      return (
        selectedDate.from?.getTime() === firstDate.getTime() &&
        selectedDate.to?.getTime() === lastDate.getTime()
      );
    };

    const isLastMonth = (selectedDate: DateRange) => {
      const { firstDate, lastDate } = getFirstAndLastDateOfPreviousMonth();
      return (
        selectedDate.from?.getTime() === firstDate.getTime() &&
        selectedDate.to?.getTime() === lastDate.getTime()
      );
    };

    setTempDate(selectedDate);
    if (selectedDate.from && selectedDate.to) {
      if (isToday(selectedDate)) {
        setPredefinedRangeValues("today", false);
      } else if (isPrevious7Days(selectedDate)) {
        setPredefinedRangeValues("last_7_days", false);
      } else if (isThisMonth(selectedDate)) {
        setPredefinedRangeValues("this_month", false);
      } else if (isLastMonth(selectedDate)) {
        setPredefinedRangeValues("last_month", false);
      } else {
        setPredefinedRangeValues("custom", true);
      }
    } else {
      setPredefinedRangeValues("empty_select", false);
    }
  }, [selectedDate]);

  const isDefaultValue =
    tempDate.to?.getFullYear() === defaultSelectedDate.to?.getFullYear() &&
    tempDate.to?.getMonth() === defaultSelectedDate.to?.getMonth() &&
    tempDate.to?.getDay() === defaultSelectedDate.to?.getDay();

  useEffect(() => {
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");

    if (tempDate.from && tempDate.to) {
      prevSelectedRangeRef.current = tempDate;
      setStartDate(format(tempDate.from, "dd/MM/yyyy"));
      setStartTime(format(tempDate.from, "HH:mm:ss"));
      setEndDate(format(tempDate.to, "dd/MM/yyyy"));
      setEndTime(format(tempDate.to, "HH:mm:ss"));
      return;
    }
    if (tempDate.from) {
      setStartDate(format(tempDate.from, "dd/MM/yyyy"));
      setStartTime(format(tempDate.from, "HH:mm:ss"));
    }
    if (tempDate.to) {
      setEndDate(format(tempDate.to, "dd/MM/yyyy"));
      setEndTime(format(tempDate.to, "HH:mm:ss"));
    }
  }, [tempDate]);

  const isValidDate = (dateString: string) => {
    const match = DATE_REGEX.exec(dateString);
    if (!match) return false;
    const day = parseInt(match[1] ?? "", 10);
    const month = parseInt(match[2] ?? "", 10) - 1;
    const year = parseInt(match[3] ?? "", 10);
    const date = new Date(year, month, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    );
  };

  const isValidStartDate = (timeString: string, dateString: string) => {
    if (!allowedStartDate) {
      return true;
    }
    const date = getDatetimeFromInputs(timeString, dateString, isValidDate);
    if (!date) return false;

    // Compare only up to minutes (ignore seconds and milliseconds)
    const dateMinutes = Math.floor(date.getTime() / 60000);
    const allowedMinutes = Math.floor(allowedStartDate.getTime() / 60000);
    return dateMinutes >= allowedMinutes;
  };

  const isValidEndDate = (timeString: string, dateString: string) => {
    if (!allowedEndDate) {
      return true;
    }
    const date = getDatetimeFromInputs(timeString, dateString, isValidDate);
    if (!date) return false;

    // Compare only up to minutes (ignore seconds and milliseconds)
    const dateMinutes = Math.floor(date.getTime() / 60000);
    const allowedMinutes = Math.floor(allowedEndDate.getTime() / 60000);
    return dateMinutes <= allowedMinutes;
  };

  const isValidDateRange =
    isValidStartDate(startTime, startDate) && isValidEndDate(endTime, endDate);

  const getFirstAndLastDateOfPreviousMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const firstDayOfPreviousMonth =
      currentMonth === 0
        ? new Date(currentYear - 1, 11, 1)
        : new Date(currentYear, currentMonth - 1, 1);

    const lastDayOfPreviousMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
      999,
    );

    const firstDate = allowedStartDate
      ? new Date(
          Math.max(
            allowedStartDate.getTime(),
            firstDayOfPreviousMonth.getTime(),
          ),
        )
      : firstDayOfPreviousMonth;

    return {
      firstDate,
      lastDate: lastDayOfPreviousMonth,
    };
  };

  const lastSevenDaysRange = () => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);

    sevenDaysAgo.setHours(0, 0, 0, 0);
    today.setSeconds(59, 999);

    return {
      firstDate: sevenDaysAgo,
      lastDate: today,
    };
  };

  const getPrevious7Days = () => {
    const today = subDays(new Date(), 1);
    const sevenDaysAgo = subDays(today, 6);

    sevenDaysAgo.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    return {
      firstDate: sevenDaysAgo,
      lastDate: today,
    };
  };

  const handleSelectCalendar = (selectedValue: DateRange | undefined) => {
    const selectedRange = selectedValue ?? prevSelectedRangeRef.current;

    const updatedRange = applyTimeToDateRange(
      selectedRange,
      startTime,
      endTime,
      getFirstAndLastDateOfThisMonth,
    );

    setTempDate(updatedRange);
    setTempPredefinedRange(t("common.date_picker.custom"));
    setTempCustomRange(true);
    setFormatValidator(false);
  };

  const handleSave = () => {
    if (!formatValidator) {
      let res = tempDate;
      if (startTime) {
        const [hours, minutes, seconds] = startTime.split(":");
        const startDateNew =
          tempDate.from?.setHours(
            Number(hours),
            Number(minutes),
            Number(seconds),
          ) ?? new Date();
        res = { ...res, from: new Date(startDateNew) };
      }
      if (endTime) {
        const [hours, minutes, seconds] = endTime.split(":");
        const endDateNew =
          tempDate.to?.setHours(
            Number(hours),
            Number(minutes),
            Number(seconds),
          ) ?? new Date();
        res = { ...res, to: new Date(endDateNew) };
      }
      setSelectedDate(res);
      onChangeSelectedDate(res);
      setPredefinedRange(tempPredefinedRange);
      setCustomRange(tempCustomRange);
      if (applyBtn.handleApply) applyBtn.handleApply();
    }
  };

  const handleCancel = () => {
    setFormatValidator(false);
    setTempDate(selectedDate);
    setTempPredefinedRange(predefinedRange);
    setTempCustomRange(customRange);
    if (cancelBtn.handleCancel) cancelBtn.handleCancel();
    if (selectedDate.from) {
      setStartDate(format(selectedDate.from, "dd/MM/yyyy"));
      setStartTime(format(selectedDate.from, "HH:mm:ss"));
    }
    if (selectedDate.to) {
      setEndDate(format(selectedDate.to, "dd/MM/yyyy"));
      setEndTime(format(selectedDate.to, "HH:mm:ss"));
    }
  };

  const formatDateRange = (from: Date, to?: Date) => {
    if (to) {
      return (
        <>
          {`${t("common.date_picker.from")} ${format(from, "HH:mm - dd/MM/yyyy")} ${t("common.date_picker.to")} ${format(to, "HH:mm - dd/MM/yyyy")}`}
        </>
      );
    }
    return format(from, "HH:mm dd/MM/yyyy");
  };

  const getSelectedRangeDisplayText = () => {
    if (!customRange && !ignorePredefinedRange) {
      return <span>{predefinedRange}</span>;
    }

    if (!showDetailedCustomRange)
      return <span>{t("common.date_picker.custom")}</span>;
    if (selectedDate.from)
      return formatDateRange(selectedDate.from, selectedDate.to);
    return <span>{t("common.date_picker.empty_select")}</span>;
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    onOpen?.(isOpen);
  };

  const isDisabled = (date: Date) => {
    // Compare only by date (ignore time) to allow selecting the boundary day
    const dateOnly = startOfDay(date);
    const allowedStartDateOnly = allowedStartDate
      ? startOfDay(allowedStartDate)
      : null;
    const allowedEndDateOnly = allowedEndDate
      ? startOfDay(allowedEndDate)
      : null;

    if (
      (allowedStartDateOnly && dateOnly < allowedStartDateOnly) ||
      (allowedEndDateOnly && dateOnly > allowedEndDateOnly)
    ) {
      return true;
    }
    return false;
  };

  const { className: triggerClassName, ...triggerButtonProps } =
    triggerProps ?? {};

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover
        open={enableManualOpen ?? isOpen}
        onOpenChange={handleOpenChange}
      >
        <PopoverTrigger asChild>
          {toggleDatePicker ? (
            <Button
              id="date"
              {...triggerButtonProps}
              variant={"tertiary"}
              className={cn(
                "group/datepicker border-neutral-200 pr-2 text-left text-base font-normal",
                "hover:border-neutral-400 hover:bg-neutral-0 hover:shadow-D-X0-Y0-B6-S0-30",
                "active:shadow-D-X0-Y0-B6-S0-30 data-[state='open']:shadow-D-X0-Y0-B6-S0-30",
                "z-10",
                triggerClassName,
                {
                  "rounded-bl-none rounded-tl-none border-l-0":
                    hasRightBorderRadius,
                },
              )}
            >
              <div className="flex w-full items-center justify-between">
                {getSelectedRangeDisplayText()}
                <div className={"ml-2 flex items-center gap-1"}>
                  {showClear && selectedDate.from && selectedDate.to && (
                    <TooltipContainer content={t("common.actions.delete")}>
                      <span className="hidden group-hover/datepicker:block group-focus/datepicker:block group-aria-expanded/datepicker:block">
                        <ClearContent
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate({
                              from: undefined,
                            });
                            setTempDate({
                              from: undefined,
                            });
                            onChangeSelectedDate({
                              from: undefined,
                            });
                          }}
                        />
                      </span>
                    </TooltipContainer>
                  )}
                  {rightIcon}
                </div>
              </div>
            </Button>
          ) : (
            <div className="h-0">&nbsp;</div>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          collisionPadding={24}
          className="my-1 flex w-auto flex-col gap-2.5 px-[1.25rem] py-[0.9375rem]"
        >
          <div className="flex gap-[0.9375rem]">
            {triggerQuickSelect && (
              <div className="flex min-w-28 flex-col items-start gap-4">
                <button
                  className={cn(DATE_BUTTON_CLASS, {
                    "font-bold":
                      t("common.date_picker.today") == tempPredefinedRange,
                  })}
                  onClick={() => {
                    handleQuickSelect(
                      {
                        from: startOfToday(),
                        to: getFirstAndLastDateOfThisMonth().lastDate,
                      },
                      t("common.date_picker.today"),
                      false,
                    );
                  }}
                >
                  {t("common.date_picker.today")}
                </button>

                <button
                  className={cn(DATE_BUTTON_CLASS, {
                    "font-bold":
                      t("common.date_picker.last_7_days") ==
                      tempPredefinedRange,
                  })}
                  onClick={() => {
                    handleQuickSelect(
                      {
                        from: getPrevious7Days().firstDate,
                        to: getPrevious7Days().lastDate,
                      },
                      t("common.date_picker.last_7_days"),
                      false,
                    );
                  }}
                >
                  {t("common.date_picker.last_7_days")}
                </button>

                {isShowMonthOptions && (
                  <button
                    className={cn(DATE_BUTTON_CLASS, {
                      "font-bold":
                        t("common.date_picker.this_month") ==
                        tempPredefinedRange,
                    })}
                    onClick={() => {
                      handleQuickSelect(
                        {
                          from: getFirstAndLastDateOfThisMonth().firstDate,
                          to: getFirstAndLastDateOfThisMonth().lastDate,
                        },
                        t("common.date_picker.this_month"),
                        false,
                      );
                    }}
                  >
                    {t("common.date_picker.this_month")}
                  </button>
                )}

                {isShowMonthOptions && (
                  <button
                    className={cn(DATE_BUTTON_CLASS, {
                      "font-bold":
                        t("common.date_picker.last_month") ==
                        tempPredefinedRange,
                    })}
                    onClick={() => {
                      handleQuickSelect(
                        {
                          from: getFirstAndLastDateOfPreviousMonth().firstDate,
                          to: getFirstAndLastDateOfPreviousMonth().lastDate,
                        },
                        t("common.date_picker.last_month"),
                        false,
                      );
                    }}
                  >
                    {t("common.date_picker.last_month")}
                  </button>
                )}

                <button
                  className={cn(DATE_BUTTON_CLASS, {
                    "font-bold":
                      t("common.date_picker.custom") == tempPredefinedRange,
                  })}
                  onClick={() => {
                    handleQuickSelect(
                      {
                        from: lastSevenDaysRange().firstDate,
                        to: lastSevenDaysRange().lastDate,
                      },
                      t("common.date_picker.custom"),
                      true,
                    );
                  }}
                >
                  {t("common.date_picker.custom")}
                </button>
              </div>
            )}

            <div
              className={`flex flex-col ${triggerQuickSelect ? "border-l pl-[0.9375rem]" : ""}`}
            >
              <Calendar
                classNames={calendarClassName}
                {...(tempDate.to && {
                  month:
                    isDefaultValue && isShowLastMonth
                      ? new Date(
                          tempDate.to.getFullYear(),
                          tempDate.to.getMonth() - 1,
                        )
                      : tempDate.to,
                })}
                locale={locales[locale]}
                mode="range"
                numberOfMonths={2}
                selected={tempDate}
                showOutsideDays={false}
                onSelect={handleSelectCalendar}
                disabled={isDisabled}
                monthNavigation={monthNavigation}
              />

              <div className="mt-2.5 grid justify-items-center gap-3 sm:grid-cols-1 md:grid-cols-2 2xl:gap-[1.875rem]">
                <div className="col-span-1 grid w-[17.5rem] grid-cols-2 gap-2.5">
                  <div className="col-span-1">
                    <DateInput
                      id="start-date-input"
                      value={startDate}
                      tempDate={tempDate}
                      time={startTime}
                      label={t("common.date_picker.start_date")}
                      setDate={setStartDate}
                      setTime={setStartTime}
                      setTempDate={setTempDate}
                      setFormatValidator={setFormatValidator}
                      isValidDate={isValidDate}
                      type="start"
                    />
                  </div>

                  <div className="col-span-1">
                    <CustomTimePicker
                      label={t("common.date_picker.start_time")}
                      placeholder=""
                      value={startTime}
                      date={startDate}
                      tempDate={tempDate}
                      setTime={setStartTime}
                      setDate={setStartDate}
                      setTempDate={setTempDate}
                      type="start"
                      isValidDate={isValidDate}
                      allowSeconds={allowSeconds}
                    />
                  </div>
                </div>

                <div className="col-span-1 grid w-[17.5rem] grid-cols-2 gap-2.5">
                  <div className="col-span-1">
                    <DateInput
                      id="end-date-input"
                      value={endDate}
                      tempDate={tempDate}
                      time={endTime}
                      label={t("common.date_picker.end_date")}
                      setDate={setEndDate}
                      setTime={setEndTime}
                      setTempDate={setTempDate}
                      setFormatValidator={setFormatValidator}
                      isValidDate={isValidDate}
                      type="end"
                    />
                  </div>

                  <div className="col-span-1">
                    <CustomTimePicker
                      label={t("common.date_picker.end_time")}
                      placeholder=""
                      value={endTime}
                      date={endDate}
                      tempDate={tempDate}
                      setTime={setEndTime}
                      setDate={setEndDate}
                      setTempDate={setTempDate}
                      type="end"
                      isValidDate={isValidDate}
                      allowSeconds={allowSeconds}
                    />
                  </div>
                </div>
              </div>

              {formatValidator && (
                <div className="mt-1">
                  <span className="text-red-900">
                    <span className="text-base">
                      {t("common.date_picker.format_validator")}
                    </span>
                  </span>
                </div>
              )}
              {tempDate.from &&
                tempDate.to &&
                !formatValidator &&
                !isValidDateRange && (
                  <div className="mt-1">
                    <span className="text-red-900">
                      <span className="text-base">
                        {t("common.date_picker.range_validator")}
                        {`${formatDatetime(allowedStartDate ?? new Date(), validateDateTimeFormat)} - ${formatDatetime(allowedEndDate ?? new Date(), validateDateTimeFormat)}`}
                      </span>
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t pt-2.5">
            <PopoverClose asChild>
              <Button
                leftIcon={cancelBtn.leftIcon}
                variant="tertiary"
                onClick={() => {
                  handleCancel();
                }}
              >
                {cancelBtn.title ?? t("common.date_picker.cancel")}
              </Button>
            </PopoverClose>

            <PopoverClose asChild>
              <Button
                disabled={
                  formatValidator ||
                  !tempDate.from ||
                  !tempDate.to ||
                  !isValidDateRange
                }
                leftIcon={applyBtn.leftIcon}
                onClick={() => {
                  handleSave();
                }}
              >
                {applyBtn.title ?? t("common.date_picker.apply")}
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DateInputProps {
  id: string;
  value: string;
  tempDate: DateRange;
  time: string;
  label?: string;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  setTempDate: (tempDate: DateRange) => void;
  setFormatValidator: (isValid: boolean) => void;
  isValidDate: (date: string) => boolean;
  type: "start" | "end";
}

interface CustomTimePickerProps {
  label?: string;
  placeholder?: string;
  value: string;
  date: string;
  allowSeconds?: boolean;
  tempDate: DateRange;
  setTime: (time: string) => void;
  setDate: (date: string) => void;
  setTempDate: (tempDate: DateRange) => void;
  type: "start" | "end";
  isValidDate: (date: string) => boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  tempDate,
  time,
  label,
  setDate,
  setTime,
  setTempDate,
  setFormatValidator,
  isValidDate,
  type,
}) => {
  const { t } = useLayoutStore((state) => state);
  const validateDate = (dateValue: string): boolean => {
    if (!isValidDate(dateValue)) {
      setFormatValidator(true);
      return false;
    }
    setFormatValidator(false);
    return true;
  };

  const parseDate = (dateValue: string): Date => {
    const [hours, minutes] = (time || (type === "start" ? "00:00" : "23:59"))
      .split(":")
      .map(Number);

    const [day, month, year] = dateValue.split("/");
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      minutes,
    );
  };

  const handleInvalidDateCondition = (
    isStart: boolean,
    parsedDate: Date,
    tempDate: { from?: Date; to?: Date },
  ): void => {
    setDate("");
    setTime("");
    setTempDate({
      from: isStart ? parsedDate : tempDate.from,
      to: undefined,
    });
  };

  const updateTempDate = (
    isStart: boolean,
    parsedDate: Date,
    tempDate: { from?: Date; to?: Date },
  ): void => {
    setTempDate({
      from: isStart ? parsedDate : tempDate.from,
      to: isStart ? tempDate.to : parsedDate,
    });
  };

  const handleTimeUpdate = (
    isStart: boolean,
    time: string,
    parsedDate: Date,
  ): void => {
    const [hours, min, seconds] = time.split(":");
    parsedDate.setHours(
      Number(hours),
      Number(min),
      Number(seconds),
      isStart ? 0 : 999,
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setDate(dateValue);

    try {
      if (!validateDate(dateValue)) return;

      const parsedDate = parseDate(dateValue);
      const isStart = type === "start";
      const conditionInvalid = isStart
        ? tempDate.to && parsedDate > tempDate.to
        : tempDate.from && parsedDate < tempDate.from;

      if (!conditionInvalid) {
        updateTempDate(isStart, parsedDate, tempDate);
        if (time) {
          handleTimeUpdate(isStart, time, parsedDate);
        }
        return;
      }
      handleInvalidDateCondition(isStart, parsedDate, tempDate);
    } catch (error) {
      console.error("An error has occurred: ", error);
      setFormatValidator(true);
    }
  };

  return (
    <div className="group/date-input col-span-1 flex flex-col space-y-1">
      <label className="text-base leading-5 text-neutral-800" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        className="form-input"
        rightIcon={
          value && (
            <TooltipContainer
              isPreventDefault={false}
              content={t("common.actions.delete")}
              disableHoverableContent={true}
            >
              <button
                tabIndex={-1}
                className="hidden group-hover/date-input:block group-has-[input:focus]/date-input:block"
                onClick={() => {
                  const isStart = type === "start";
                  setTempDate(
                    isStart
                      ? {
                          from: undefined,
                          to: tempDate.to,
                        }
                      : {
                          from: tempDate.from,
                          to: undefined,
                        },
                  );
                }}
              >
                <ClearContent />
              </button>
            </TooltipContainer>
          )
        }
      />
    </div>
  );
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  placeholder = "",
  value,
  date,
  tempDate,
  setTime,
  setDate,
  setTempDate,
  type,
  isValidDate,
  allowSeconds,
}) => {
  const createTempDate = (
    date: string,
    value: string,
    isStart: boolean,
  ): Date => {
    const [day, month, year] = date.split("/");
    const [hours, min, seconds] = value.split(":");
    const tempDateObj = new Date(Number(year), Number(month) - 1, Number(day));

    tempDateObj.setHours(
      Number(hours),
      Number(min),
      Number(seconds),
      isStart ? 0 : 999,
    );

    return tempDateObj;
  };

  const handleInvalidCondition = (
    isStart: boolean,
    tempDateObj: Date,
    tempDate: { from?: Date; to?: Date },
  ): void => {
    setDate("");
    setTime("");
    setTempDate({
      from: isStart ? tempDateObj : tempDate.from,
    });
  };

  const updateValidCondition = (
    isStart: boolean,
    value: string,
    tempDateObj: Date,
    tempDate: { from?: Date; to?: Date },
  ): void => {
    setTime(value);
    setTempDate({
      from: isStart ? tempDateObj : tempDate.from,
      to: isStart ? tempDate.to : tempDateObj,
    });
  };

  const handleChange = (value: string) => {
    if (!isValidDate(date)) return;

    const isStart = type === "start";
    const tempDateObj = createTempDate(date, value, isStart);

    const conditionInvalid = isStart
      ? tempDate.to && tempDateObj > tempDate.to
      : tempDate.from && tempDateObj < tempDate.from;

    if (!conditionInvalid) {
      updateValidCondition(isStart, value, tempDateObj, tempDate);
      return;
    }
    handleInvalidCondition(isStart, tempDateObj, tempDate);
  };

  return (
    <div className="col-span-1 flex flex-col space-y-1">
      <label className="text-base leading-5 text-neutral-800">{label}</label>
      <TimePicker
        minuteStep={1}
        placeholder={placeholder}
        selectedTime={value}
        onChange={handleChange}
        allowSeconds={allowSeconds}
      />
    </div>
  );
};

export const getDatetimeFromInputs = (
  timeString: string,
  dateString: string,
  isValidDate: (date: string) => boolean,
) => {
  const dateMatch = DATE_REGEX.exec(dateString);

  if (!dateMatch || !isValidDate(dateString)) return false;

  const day = parseInt(dateMatch[1] ?? "", 10);
  const month = parseInt(dateMatch[2] ?? "", 10) - 1;
  const year = parseInt(dateMatch[3] ?? "", 10);
  const [hours, minutes] = timeString.split(":").map(Number);

  return new Date(year, month, day, hours, minutes, 0, 0);
};

/**
 * Parses a time string "HH:mm:ss" into an object with hours, minutes, seconds.
 * Returns default values if parsing fails.
 */
const parseTimeString = (
  timeString: string | undefined,
  defaultHours: number,
  defaultMinutes: number,
  defaultSeconds: number,
): { hours: number; minutes: number; seconds: number } => {
  if (!timeString) {
    return {
      hours: defaultHours,
      minutes: defaultMinutes,
      seconds: defaultSeconds,
    };
  }
  const parts = timeString.split(":").map(Number);
  const hours = parts[0] ?? NaN;
  const minutes = parts[1] ?? NaN;
  const seconds = parts[2] ?? NaN;
  return {
    hours: Number.isFinite(hours) ? hours : defaultHours,
    minutes: Number.isFinite(minutes) ? minutes : defaultMinutes,
    seconds: Number.isFinite(seconds) ? seconds : defaultSeconds,
  };
};

/**
 * Creates a new Date with the given date and time components.
 */
const createDateWithTime = (
  baseDate: Date,
  hours: number,
  minutes: number,
  seconds: number,
  milliseconds: number,
): Date => {
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    seconds,
    milliseconds,
  );
};

/**
 * Applies time values to a DateRange, preserving the current time when changing dates.
 */
const applyTimeToDateRange = (
  range: DateRange,
  startTimeStr: string,
  endTimeStr: string,
  getMonthBoundary: () => { firstDate: Date; lastDate: Date },
): DateRange => {
  const result: DateRange = { ...range };

  if (range.from) {
    const { hours, minutes, seconds } = parseTimeString(startTimeStr, 0, 0, 0);
    result.from = createDateWithTime(range.from, hours, minutes, seconds, 0);
  }

  if (range.to) {
    const isLastDateOfMonth =
      range.to.toDateString() === getMonthBoundary().lastDate.toDateString();

    if (isLastDateOfMonth) {
      result.to = getMonthBoundary().lastDate;
    } else {
      const { hours, minutes, seconds } = parseTimeString(
        endTimeStr,
        23,
        59,
        59,
      );
      result.to = createDateWithTime(range.to, hours, minutes, seconds, 999);
    }
  }

  return result;
};
