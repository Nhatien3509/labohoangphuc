import {
  calculateResponsiveColWidth,
  formatCurrency,
  numberToDate,
  roundToNearestEven,
} from "@common/lib/helpers/numbers";

import { describe, expect, test } from "vitest";

describe("convert a number to currency string (default: vi-VN and VND)", () => {
  test("int numbers", () => {
    expect(formatCurrency(10)).toBe("10");
    expect(formatCurrency(1000)).toBe("1.000");
    expect(formatCurrency(20030)).toBe("20.030");
    expect(formatCurrency(340000200)).toBe("340.000.200");
  });

  test("float numbers", () => {
    expect(formatCurrency(1234.5)).toBe("1.234,5");
    expect(formatCurrency(1234.56)).toBe("1.234,56");
    expect(formatCurrency(1234.563)).toBe("1.234,56");
    expect(formatCurrency(1234567.8912)).toBe("1.234.567,89");
  });

  test("trailing zeros", () => {
    expect(formatCurrency(10.0)).toBe("10");
    expect(formatCurrency(1000.0)).toBe("1.000");
  });

  test("negative numbers", () => {
    expect(formatCurrency(-1)).toBe("-1");
    expect(formatCurrency(-1234.56)).toBe("-1.234,56");
  });

  test("currency symbols", () => {
    expect(
      formatCurrency(100, {
        isShowCurrency: true,
        currency: "VND",
        locale: "vi-VN",
      }),
      "No spacing between number and VND currency symbol",
    ).toEqual("100₫");
    expect(
      formatCurrency(100, {
        isShowCurrency: true,
        locale: "en-US",
        currency: "USD",
      }),
    ).toBe("$100");
  });

  test("show + sign", () => {
    expect(formatCurrency(100, { showPlusSign: true })).toEqual("+100");
  });
});

describe("convert a number to date)", () => {
  test("invalid", () => {
    expect(numberToDate(-1)).toBe("Invalid");
    expect(numberToDate(0)).toBe("Invalid");
    expect(numberToDate(2.5)).toBe("Invalid");
    expect(numberToDate(32)).toBe("Invalid");
  });

  test("locale = en", () => {
    expect(numberToDate(1)).toBe("1st");
    expect(numberToDate(21)).toBe("21st");
    expect(numberToDate(31)).toBe("31st");
    expect(numberToDate(2)).toBe("2nd");
    expect(numberToDate(22)).toBe("22nd");
    expect(numberToDate(3)).toBe("3rd");
    expect(numberToDate(23)).toBe("23rd");

    expect(numberToDate(4)).toBe("4th");
    expect(numberToDate(10)).toBe("10th");
    expect(numberToDate(11)).toBe("11th");
    expect(numberToDate(12)).toBe("12th");
    expect(numberToDate(20)).toBe("20th");
    expect(numberToDate(29)).toBe("29th");
    expect(numberToDate(30)).toBe("30th");
  });

  test("locale = vi", () => {
    expect(numberToDate(1, "vi")).toBe("Ngày 1");
    expect(numberToDate(11, "vi")).toBe("Ngày 11");
    expect(numberToDate(20, "vi")).toBe("Ngày 20");
    expect(numberToDate(28, "vi")).toBe("Ngày 28");
    expect(numberToDate(31, "vi")).toBe("Ngày 31");
  });
});

describe("round to the nearest even integer", () => {
  test("round numbers to the nearest even number", () => {
    expect(roundToNearestEven(4.4)).toBe(4);
    expect(roundToNearestEven(3.9)).toBe(4);
    expect(roundToNearestEven(5.1)).toBe(6);
    expect(roundToNearestEven(3)).toBe(4);
    expect(roundToNearestEven(5)).toBe(6);
  });

  test("keep even numbers unchanged", () => {
    expect(roundToNearestEven(2)).toBe(2);
    expect(roundToNearestEven(4)).toBe(4);
    expect(roundToNearestEven(6)).toBe(6);
  });

  test("handle negative numbers correctly", () => {
    expect(roundToNearestEven(-2.9)).toBe(-2);
    expect(roundToNearestEven(-3.5)).toBe(-4);
    expect(roundToNearestEven(-4.1)).toBe(-4);
  });

  test("handle zero correctly", () => {
    expect(roundToNearestEven(0)).toBe(0);
  });
});

describe("calculate responsive data table column width", () => {
  test("should scale all widths proportionally", () => {
    const result = calculateResponsiveColWidth(1000, 1200, 100, 100, 200, 300);
    const totalResponsiveWidth = 1200 - 100;
    const totalDefaultWidth = 1000 - 100;
    const scale = totalResponsiveWidth / totalDefaultWidth;
    const expected = [100, 200, 300].map((w) => w * scale);
    expect(result).toEqual(expected);
  });

  test("no columns", () => {
    const result = calculateResponsiveColWidth(1000, 1200, 100);
    expect(result).toEqual([]);
  });

  test("tableWidth equal to defaultTableWidth", () => {
    const result = calculateResponsiveColWidth(1000, 1000, 100, 150, 250);
    expect(result).toEqual([150, 250]);
  });

  test("should scale down widths correctly", () => {
    const result = calculateResponsiveColWidth(1500, 1200, 100, 100, 200, 300);
    const expected = [100, 200, 300].map(
      (w) => w * ((1200 - 100) / (1500 - 100)),
    );
    expect(result).toEqual(expected);
  });
});
