import { CRON_FIELD_COUNT, type CronExpression } from "./const";

export const parseCronExpression = (expression: string): CronExpression => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== CRON_FIELD_COUNT) {
    throw new Error("Invalid cron expression format. Expected 5 fields.");
  }
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];
  return { minute, hour, dayOfMonth, month, dayOfWeek };
};
