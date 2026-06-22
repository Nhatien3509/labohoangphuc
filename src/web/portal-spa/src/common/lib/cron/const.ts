export const CRON_FIELD_COUNT = 5;

export const MonthNames = Object.freeze({
  Jan: "jan",
  Feb: "feb",
  Mar: "mar",
  Apr: "apr",
  May: "may",
  Jun: "jun",
  Jul: "jul",
  Aug: "aug",
  Sep: "sep",
  Oct: "oct",
  Nov: "nov",
  Dec: "dec",
});

export type CronExpression = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};
