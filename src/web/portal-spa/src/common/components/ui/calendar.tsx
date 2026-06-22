"use client";

import { Button } from "@common/components/ui/button";

import * as React from "react";
import {
  ChevronLeft,
  ChevronLeftV2,
  ChevronRight,
  ChevronRightV2,
  DoubleArrowLeft,
  DoubleArrowRight,
} from "@common/components/icons";

import { type Locale, format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@common/lib/core/utils";
import { useState } from "react";
import { vi } from "date-fns/locale";
import { withExtraProps } from "@common/components/containers/Hoc";

export type MonthNavigationOptions = {
  previousDisabled?: boolean;
  nextDisabled?: boolean;
};

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  monthNavigation?: MonthNavigationOptions;
};

type CaptionLabelWrapperProps = React.ComponentProps<"div"> & {
  setTime: (value: Date) => void;
  time: Date;
  locale: Partial<Locale>;
  handleMonthClick: () => void;
  handleYearClick: () => void;
};

function CaptionLabelWrapper({
  setTime,
  time,
  locale,
  handleMonthClick,
  handleYearClick,
}: CaptionLabelWrapperProps) {
  return (
    <div className="mb-1 flex h-12 w-[17.5rem] items-center justify-between space-x-2 border-b">
      <div className="flex">
        <DoubleArrowLeft
          className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
          onClick={() => {
            const newDate = new Date(time);
            newDate.setFullYear(time.getFullYear() - 1);
            setTime(newDate);
          }}
        />
        <ChevronLeft
          className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
          onClick={() => {
            const newDate = new Date(time);
            newDate.setMonth(time.getMonth() - 1);
            setTime(newDate);
          }}
        />
      </div>
      <div>
        <button className="text-base font-medium" onClick={handleMonthClick}>
          {time.toLocaleDateString(locale.code, {
            month: "long",
          }) + ","}
        </button>
        <button className="text-base font-medium" onClick={handleYearClick}>
          &nbsp;
          {time.toLocaleDateString(locale.code, {
            year: "numeric",
          })}
        </button>
      </div>
      <div className="flex">
        <ChevronRight
          className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
          onClick={() => {
            const newDate = new Date(time);
            newDate.setMonth(time.getMonth() + 1);
            setTime(newDate);
          }}
        />
        <DoubleArrowRight
          className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
          onClick={() => {
            const newDate = new Date(time);
            newDate.setFullYear(time.getFullYear() + 1);
            setTime(newDate);
          }}
        />
      </div>
    </div>
  );
}

const Chevron = (props: { orientation?: "up" | "down" | "left" | "right" }) => {
  if (props.orientation === "left") return <ChevronLeftV2 />;
  return <ChevronRightV2 />;
};

const dayPickerNavButtonClass =
  "focus-visible focus-visible:rounded h-6 w-6 bg-transparent p-0 z-[999] border-none text-neutral-800 hover:text-primary-100";

const disabledNavButtonClass =
  "pointer-events-none cursor-not-allowed text-neutral-300 hover:text-neutral-300";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = vi,
  month,
  monthNavigation = {
    previousDisabled: false,
    nextDisabled: false,
  },
  ...props
}: CalendarProps) {
  const [time, setTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [isShowMonthPicker, setIsShowMonthPicker] = useState(false);
  const [isShowYearPicker, setIsShowYearPicker] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  React.useEffect(() => {
    if (month && month.getMonth() !== time.getMonth() + 1) {
      setTime(month);
      setTempTime(month);
    }
  }, [month]);

  const handleMonthClick = () => {
    setIsShowMonthPicker(true);
    setTempTime(time);
  };

  const handleYearClick = () => {
    setIsShowYearPicker(true);
    setIsShowMonthPicker(false);
    setTempTime(time);
  };

  const handleSelectMonth = (selectedMonth: number) => {
    const year = tempTime.getFullYear();
    setTime(new Date(year, selectedMonth));
    setIsShowMonthPicker(false);
  };

  const handleSelectYear = (selectedYear: number) => {
    const month = time.getMonth();
    setTime(new Date(selectedYear, month));
    setIsShowYearPicker(false);
  };

  const CaptionLabel = withExtraProps(CaptionLabelWrapper, {
    handleMonthClick,
    handleYearClick,
    locale,
    setTime,
    time,
  });

  return (
    <>
      <div>
        {!isShowMonthPicker && !isShowYearPicker && (
          <DayPicker
            className={cn("p-0", className)}
            locale={locale}
            month={time}
            showOutsideDays={showOutsideDays}
            classNames={{
              months:
                "flex flex-col justify-around gap-[1.875rem] md:flex-row sm:space-y-0",
              month: "w-[17.5rem]",
              month_grid: cn(" w-full border-collapse space-y-1", {
                "mt-4": props.mode === "single",
              }),
              month_caption: "flex justify-center relative h-8 items-center",
              caption_label: "text-md font-medium capitalize",
              nav: "flex w-[75%] h-8 items-center absolute justify-between",
              button_next: cn(dayPickerNavButtonClass, {
                [disabledNavButtonClass]: monthNavigation.nextDisabled,
              }),
              button_previous: cn(dayPickerNavButtonClass, {
                [disabledNavButtonClass]: monthNavigation.previousDisabled,
              }),
              weekdays: "h-8 flex w-full items-center justify-around",
              weekday:
                "flex items-center justify-center h-full w-full text-neutral-400 rounded-md font-normal text-base",
              week: "flex w-full mt-[0.34375rem] justify-around",
              selected:
                "bg-primary-100 rounded-[0.25rem] text-neutral-0 hover:bg-primary-200 hover:text-primary-foreground focus:bg-primary-100 focus:text-primary-foreground date-selected",
              day: "h-7 w-[2.50rem] text-center text-base p-0 relative",
              day_button:
                "focus-visible:rounded focus-visible:border-primary-200 focus-visible:border h-full w-full p-0 text-md font-normal aria-selected:opacity-100 hover:font-semibold",
              range_start: "rounded-[0.25rem] text-neutral-0",
              range_end: "rounded-[0.25rem] text-neutral-0",
              today:
                "border border-primary-100 rounded-[0.25rem] !text-neutral-800 date-today",
              outside:
                "text-muted-foreground opacity-50 aria-selected:bg-primary-100 aria-selected:text-primary-foreground aria-selected:opacity-30",
              disabled: "text-muted-foreground opacity-50",
              range_middle:
                "aria-selected:bg-primary-50 text-neutral-800 aria-selected:text-accent-foreground date-range rounded-none",
              hidden: "invisible",
              ...classNames,
            }}
            components={
              props.mode === "single"
                ? {
                    CaptionLabel: CaptionLabel,
                  }
                : {
                    Chevron,
                  }
            }
            formatters={{
              formatCaption: (date, options) =>
                format(date, "MMMM, yyyy", options),
              formatWeekdayName: (date, options) =>
                format(date, "ccccc", options),
            }}
            onMonthChange={setTime}
            {...props}
          />
        )}

        {isShowMonthPicker && (
          <div className="h-[20.75rem] w-[20.5rem] gap-3 rounded-tl-md rounded-tr-md py-6">
            <div className="mx-6 flex h-12 w-[17.5rem] items-center justify-between border-b">
              <ChevronLeft
                className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
                onClick={() => {
                  setTempTime(
                    new Date(tempTime.getFullYear() - 1, tempTime.getMonth()),
                  );
                }}
              />
              <button
                className="text-base font-medium"
                onClick={handleYearClick}
              >
                {tempTime.getFullYear()}
              </button>
              <ChevronRight
                className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
                onClick={() => {
                  setTempTime(
                    new Date(tempTime.getFullYear() + 1, tempTime.getMonth()),
                  );
                }}
              />
            </div>
            <div className="mx-6 grid h-[14rem] w-[17.5rem] grid-cols-3 gap-6 py-3">
              {Array.from({ length: 12 }, (_, index) => {
                const currentDate = new Date();

                const isPreviousYear =
                  tempTime.getFullYear() < currentDate.getFullYear();
                const isMonthDisabled =
                  isPreviousYear ||
                  (tempTime.getFullYear() === currentDate.getFullYear() &&
                    index < currentDate.getMonth());

                const isCurrentMonth =
                  index === currentDate.getMonth() &&
                  tempTime.getFullYear() === currentDate.getFullYear();

                const isSelectedMonth =
                  !!month &&
                  index === month.getMonth() &&
                  tempTime.getFullYear() === month.getFullYear();

                let monthClassname = "";
                if (
                  (!month && isCurrentMonth) ||
                  (month && !isSelectedMonth && isCurrentMonth)
                ) {
                  monthClassname =
                    "border border-primary-100 bg-neutral-0 text-neutral-800";
                } else if (isSelectedMonth) {
                  monthClassname =
                    "border border-primary-100 bg-primary-50 font-medium text-primary-100";
                }

                return (
                  <Button
                    key={index}
                    disabled={props.mode === "single" && isMonthDisabled}
                    variant="text"
                    className={cn(
                      "rounded-md px-2 text-center text-base",
                      "hover:border-none hover:bg-primary-50 hover:font-normal hover:text-neutral-800",
                      "focus:border-none focus:bg-primary-50 focus:font-normal focus:text-neutral-800 focus:shadow-none",
                      "active:bg-primary-200 active:text-neutral-0 active:shadow-none",
                      monthClassname,
                    )}
                    onClick={() => {
                      handleSelectMonth(index);
                    }}
                  >
                    {new Date(0, index).toLocaleDateString(locale.code, {
                      month: "long",
                    })}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {isShowYearPicker && (
          <div className="h-[20.75rem] w-[20.5rem] gap-3 rounded-tl-md rounded-tr-md py-6">
            <div className="mx-6 flex h-12 w-[17.5rem] items-center justify-between border-b">
              <ChevronLeft
                className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
                onClick={() => {
                  setCurrentYear(currentYear - 12);
                }}
              />
              <span className="text-base font-medium">
                {currentYear}&nbsp;-&nbsp;{currentYear + 11}
              </span>
              <ChevronRight
                className="h-4 w-4 cursor-pointer hover:text-primary-200 active:text-primary-200 active:shadow-D-X0-Y2-B4-S0-15"
                onClick={() => {
                  setCurrentYear(currentYear + 12);
                }}
              />
            </div>
            <div className="mx-6 grid h-[14rem] w-[17.5rem] grid-cols-3 gap-6 py-3">
              {Array.from({ length: 12 }, (_, index) => {
                const year = currentYear + index;
                const isCurrentYear = year === new Date().getFullYear();
                const isYearDisabled = year < new Date().getFullYear();
                const isSelectedYear = time.getFullYear() === year;

                let yearClassname = "";
                if (
                  (!month && isCurrentYear) ||
                  (month && !isSelectedYear && isCurrentYear)
                ) {
                  yearClassname =
                    "border border-primary-100 bg-neutral-0 text-neutral-800";
                } else if (isSelectedYear) {
                  yearClassname =
                    "border border-primary-100 bg-primary-50 font-medium text-primary-100";
                }

                return (
                  <Button
                    key={index}
                    disabled={props.mode === "single" && isYearDisabled}
                    variant={"text"}
                    className={cn(
                      "rounded-md p-2 text-center text-base",
                      "hover:border-none hover:bg-primary-50 hover:font-normal hover:text-neutral-800",
                      "focus:border-none focus:bg-primary-50 focus:font-normal focus:text-neutral-800 focus:shadow-none",
                      "active:bg-primary-200 active:text-neutral-0 active:shadow-none",
                      yearClassname,
                    )}
                    onClick={() => {
                      handleSelectYear(year);
                    }}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`
        td.date-selected.date-today:not(.date-range) button {
          border: 1px solid var(--neutral-0);
          border-radius: 4px;
          ${props.mode !== "single" ? "color: var(--neutral-0) !important;" : ""}
        }
    
          td:first-child.date-selected.date-range {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
    
          td:last-child.date-selected.date-range {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
      `}</style>
    </>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
