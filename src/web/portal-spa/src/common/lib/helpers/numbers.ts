import { USD, VND } from "@common/lib/core/const";

type currencyOptions = {
  locale?: string;
  isShowCurrency?: boolean;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showPlusSign?: boolean;
};

const defaultOptions: currencyOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  locale: "vi-VN",
  currency: "VND",
  isShowCurrency: false,
  showPlusSign: false,
};

export const formatCurrency = (value = 0, options?: currencyOptions) => {
  options = { ...defaultOptions, ...options };
  const formatter = new Intl.NumberFormat(options.locale, {
    style: "currency",
    currency: options.currency,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  });

  let result = formatter.format(value);

  const currencies = [USD, VND];
  const regexCurrencies = new RegExp(currencies.join("|"));
  const regexSpace = /\u00A0/; // non-breaking space introduced by formatter with vi-VN locale
  result = options.isShowCurrency
    ? result.replace(regexSpace, "")
    : result.replace(regexCurrencies, "");

  if (value > 0 && options.showPlusSign) {
    result = `+${result}`;
  }

  return result.trim();
};

export function numberToDate(date: number, locale = "en"): string {
  if (!Number.isInteger(date) || date < 1 || date > 31) {
    return "Invalid";
  }

  if (locale === "vi") {
    return "Ngày " + date.toString();
  }

  if (date % 100 >= 10 && date % 100 <= 20) {
    return `${date}th`;
  }

  const suffix =
    {
      1: "st",
      2: "nd",
      3: "rd",
    }[date % 10] ?? "th";

  return `${date}${suffix}`;
}

export function roundToNearestEven(num: number) {
  return Math.round(num / 2) * 2;
}

export const calculateResponsiveColWidth = (
  defaultTableWidth: number,
  tableWidth: number,
  fixedColumnsWidth: number,
  ...columnWidths: number[]
) => {
  const availableWidth = tableWidth - fixedColumnsWidth;
  const defaultAvailableWidth = defaultTableWidth - fixedColumnsWidth;
  const scaleFactor = availableWidth / defaultAvailableWidth;

  return columnWidths.map((width) => width * scaleFactor);
};

export const sumNumericStrings = (...values: string[]): string => {
  const total = values.reduce((acc, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid numeric string: "${val}"`);
    }
    return acc + num;
  }, 0);

  return total.toString();
};
