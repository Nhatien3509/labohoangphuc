import { DaysOfTheWeek, SLASH } from "@common/lib/core/const";
import { MonthNames } from "./const";
import type { useTranslations } from "next-intl";

export const MONTH_VALUES: string[] = Object.values(MonthNames);
export const DAY_VALUES: string[] = Object.values(DaysOfTheWeek);
export const DECIMAL_RADIX = 10;
export const MIN_MONTH = 1;
export const MIN_DAY_OF_WEEK = 0;
export const HOURS_IN_HALF_DAY = 12;
export const RANGE_PARTS_COUNT = 2;
export const ZERO_MINUTE = "0";
export const DEFAULT_HOUR_STRING = "0";

export type CronContext = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  timeStr: string;
  isTimeSpecific: boolean;
  isDateWildcard: boolean;
  t: ReturnType<typeof useTranslations>;
};

export const formatTo12Hour = (hour: number, minute: string): string => {
  const period = hour >= HOURS_IN_HALF_DAY ? "PM" : "AM";
  const hour12 = hour % HOURS_IN_HALF_DAY || HOURS_IN_HALF_DAY;
  return `${hour12.toString().padStart(2, "0")}:${minute.padStart(2, "0")} ${period}`;
};

export const formatCronTime = (hour: string, minute: string): string => {
  const hourNum = parseInt(hour, DECIMAL_RADIX);
  if (isNaN(hourNum)) {
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  return formatTo12Hour(hourNum, minute);
};

export const parseMonthNames = (
  month: string,
  t: ReturnType<typeof useTranslations>,
): string => {
  const parts = month.split(",").map((m) => {
    const lower = m.trim().toLowerCase();
    if (MONTH_VALUES.includes(lower)) {
      return t(`cron.months.${lower}`);
    }
    const num = parseInt(lower, DECIMAL_RADIX);
    if (!isNaN(num) && num >= MIN_MONTH && num <= MONTH_VALUES.length) {
      const key = MONTH_VALUES[num - MIN_MONTH];
      return key ? t(`cron.months.${key}`) : lower;
    }
    return m.trim();
  });
  if (parts.length > 1) {
    return `${parts.slice(0, -1).join(", ")} ${t("cron.and")} ${parts[parts.length - 1]}`;
  }
  return parts[0] ?? "";
};

export const parseDayOfWeekNames = (
  dayOfWeek: string,
  t: ReturnType<typeof useTranslations>,
): string => {
  const isRange = dayOfWeek.includes("-") && !dayOfWeek.includes(",");
  const parts = isRange ? dayOfWeek.split("-") : dayOfWeek.split(",");

  const dayNames = parts.map((d) => {
    const lower = d.trim().toLowerCase();
    if (DAY_VALUES.includes(lower)) {
      return t(`cron.days.${lower}`);
    }
    const num = parseInt(lower, DECIMAL_RADIX);
    if (!isNaN(num) && num >= MIN_DAY_OF_WEEK && num <= DAY_VALUES.length) {
      const key = DAY_VALUES[(num + DAY_VALUES.length - 1) % DAY_VALUES.length];
      return key ? t(`cron.days.${key}`) : lower;
    }
    return d.trim();
  });

  if (isRange && dayNames.length === RANGE_PARTS_COUNT) {
    return `${dayNames[0]} ${t("cron.through")} ${dayNames[1]}`;
  }
  return dayNames.join(", ");
};

export const isAny = (val: string) => val === "*";
export const hasStep = (val: string) => val.includes(SLASH);
export const hasRange = (val: string) => val.includes("-");
export const hasList = (val: string) => val.includes(",");
export const isSimpleNumber = (val: string) =>
  /^\d+$/.test(val) && !hasStep(val) && !hasRange(val) && !hasList(val);
