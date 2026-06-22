import { CRON_FIELD_COUNT } from "./const";
import { SLASH } from "@common/lib/core/const";

const CRON_FIELD_RANGES: { min: number; max: number }[] = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 7 },
];

const MONTH_NAMES = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i;
const DAY_NAMES = /^(MON|TUE|WED|THU|FRI|SAT|SUN)$/i;

const isValidCronField = (
  field: string,
  range: { min: number; max: number },
  fieldIndex: number,
): boolean => {
  if (field === "*") return true;

  const parts = field.split(",");
  return parts.every((part) => {
    const stepParts = part.split(SLASH);
    if (stepParts.length > 2) return false;

    const rangePart = stepParts[0] ?? "";
    const step = stepParts[1];

    if (step !== undefined) {
      if (!/^\d+$/.test(step) || Number(step) < 1) return false;
    }

    if (rangePart === "*") return true;

    const rangeValues = rangePart.split("-");
    if (rangeValues.length > 2) return false;

    return rangeValues.every((val) => {
      if (!val) return false;

      // Allow text-based month/day names
      if (fieldIndex === 3 && MONTH_NAMES.test(val)) return true;
      if (fieldIndex === 4 && DAY_NAMES.test(val)) return true;

      if (!/^\d+$/.test(val)) return false;
      const num = Number(val);
      return num >= range.min && num <= range.max;
    });
  });
};

const getMaxDaysInMonth = (month: number): number => {
  const year = new Date().getFullYear();
  return new Date(year, month, 0).getDate();
};

const parseMonthName = (name: string): number | undefined => {
  const date = Date.parse(`${name} 1, 2000`);
  if (isNaN(date)) return undefined;
  return new Date(date).getMonth() + 1;
};

const parseToken = (val: string, fieldIndex: number): number | undefined => {
  if (/^\d+$/.test(val)) return Number(val);
  if (fieldIndex === 3) return parseMonthName(val);
  return undefined;
};

const parseFieldValues = (field: string, fieldIndex: number): number[] => {
  if (field === "*") return [];

  return field
    .split(",")
    .map((part) => part.split(SLASH)[0] ?? "")
    .filter((base) => base !== "*")
    .flatMap((base) => base.split("-"))
    .filter(Boolean)
    .map((val) => parseToken(val, fieldIndex))
    .filter((num): num is number => num !== undefined);
};

const isValidDayMonthCombination = (
  dayField: string,
  monthField: string,
): boolean => {
  const months = parseFieldValues(monthField, 3);
  const days = parseFieldValues(dayField, 2);

  if (months.length === 0 || days.length === 0) return true;

  const maxRequestedDay = Math.max(...days);
  const minMonthCapacity = Math.min(
    ...months.map((month) => getMaxDaysInMonth(month)),
  );

  return maxRequestedDay <= minMonthCapacity;
};

export const validateCronExpression = (expression: string): boolean => {
  try {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== CRON_FIELD_COUNT) {
      return false;
    }
    const fieldsValid = parts.every((part, index) => {
      const range = CRON_FIELD_RANGES[index];
      if (!range) return false;
      return isValidCronField(part, range, index);
    });

    const dayField = parts[2];
    const monthField = parts[3];

    if (!fieldsValid || !dayField || !monthField) return false;

    return isValidDayMonthCombination(dayField, monthField);
  } catch {
    return false;
  }
};
