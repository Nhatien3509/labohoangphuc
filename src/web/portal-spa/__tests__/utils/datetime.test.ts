import { describe, expect, it, test } from "vitest";
import {
  getFirstAndLastDateOfThisMonth,
  isISO8601,
} from "@common/lib/helpers/datetime";
import { startOfMonth } from "date-fns";

describe("check if a date is ISO 8601", () => {
  test("valid", () => {
    expect(isISO8601("2023-08-01T10:15:30Z")).toBe(true);
    expect(isISO8601("2023-08-01")).toBe(true);
    expect(isISO8601("2023-08-01T10:15:30")).toBe(true);
    expect(isISO8601("2023-08-01T10:15:30+02:00")).toBe(true);
    expect(isISO8601("2023-08-01T10:15:30-05:00")).toBe(true);
  });

  test("invalid", () => {
    expect(isISO8601()).toBe(false);
    expect(isISO8601("")).toBe(false);
    expect(isISO8601("invalid-date")).toBe(false);
    expect(isISO8601("2023-08-01T25:61:61")).toBe(false);
    expect(isISO8601("2023-13-01")).toBe(false);
  });
});

describe("getFirstAndLastDateOfThisMonth", () => {
  it("should return the first and last date of the current month", () => {
    const result = getFirstAndLastDateOfThisMonth();

    const currentDate = new Date();
    const expectedFirstDate = startOfMonth(currentDate);
    const expectedLastDate = new Date(currentDate);
    expectedLastDate.setSeconds(59, 999);

    expect(result.firstDate).toEqual(expectedFirstDate);
    expect(result.lastDate).toEqual(expectedLastDate);
  });
});
