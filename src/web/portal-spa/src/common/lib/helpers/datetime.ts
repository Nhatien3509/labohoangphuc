import { type Locale, format, isValid, parseISO, startOfMonth } from "date-fns";
import { enUS, vi } from "date-fns/locale";

const locales: Record<string, Locale> = {
  en: enUS,
  vi: vi,
};

export const formatDatetime = (
  date: Date | null,
  formatStr = "HH:mm - dd/MM/yyyy",
  localeCode = "vi",
) => {
  return date ? format(date, formatStr, { locale: locales[localeCode] }) : "";
};

export const isISO8601 = (dateString?: string) => {
  if (!dateString) {
    return false;
  }
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate);
};

export function getThisMonth(
  toISOString: true,
  currentTimezoneOffset?: number,
): {
  startDate: string;
  endDate: string;
};
export function getThisMonth(
  toISOString?: false,
  currentTimezoneOffset?: number,
): {
  startDate: Date;
  endDate: Date;
};
export function getThisMonth(
  toISOString = false,
  currentTimezoneOffset?: number,
) {
  const now = new Date();
  const startDate = currentTimezoneOffset
    ? new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          1,
          0,
          currentTimezoneOffset,
        ),
      )
    : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0);

  const endDate = new Date();
  endDate.setSeconds(59, 999);

  return {
    startDate: toISOString ? startDate.toISOString() : startDate,
    endDate: toISOString ? endDate.toISOString() : endDate,
  };
}

export const getFirstAndLastDateOfThisMonth = () => {
  const currentDate = new Date();
  currentDate.setSeconds(59, 999);

  const firstDayOfThisMonth = startOfMonth(new Date());

  return {
    firstDate: firstDayOfThisMonth,
    lastDate: currentDate,
  };
};

// DevOps logging format
export function convertDateNow(): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}:${hours}:${minutes}:${seconds}`;
}
