import {
  base10Int,
  findLastMatchedIndex,
  getFirstAndLastName,
  getInitials,
  isPatternMatched,
  removeVietnameseTones,
  replaceLastBySeparator,
  replacePathPlaceholders,
  snakify,
  toTitleCase,
  truncateText,
  validateDomainEmail,
} from "@common/lib/helpers/str";
import { DYNAMIC_ROUTE_SEGMENT } from "@common/lib/core/const";

import { describe, expect, test } from "vitest";

describe("get first and last name", () => {
  test("edge cases", () => {
    expect(getFirstAndLastName(undefined)).toBe("");
    expect(getFirstAndLastName(null)).toBe("");
    expect(getFirstAndLastName("")).toBe("");
  });

  test("valid", () => {
    expect(getFirstAndLastName("Jane")).toBe("Jane");
    expect(getFirstAndLastName("Jane Doe")).toBe("Jane Doe");
    expect(getFirstAndLastName("Jane smith Doe")).toBe("Jane Doe");
    expect(getFirstAndLastName("JANE SMITH DOE")).toBe("JANE DOE");
    expect(getFirstAndLastName("JANE SMITH JOE DOE")).toBe("JANE DOE");
  });
});

describe("get initials of a string", () => {
  test("edge cases", () => {
    expect(getInitials(undefined)).toBe("");
    expect(getInitials(null)).toBe("");
    expect(getInitials("")).toBe("");
  });

  test("valid", () => {
    expect(getInitials("jane")).toBe("J");
    expect(getInitials("jane smith")).toBe("JS");
    expect(getInitials("Jane Smith")).toBe("JS");
    expect(getInitials("Jane smith Doe")).toBe("JD");
    expect(getInitials("Bob smith Doe jane")).toBe("BJ");
  });
});

describe("convert a string to title case", () => {
  test("edge cases", () => {
    expect(toTitleCase(undefined)).toBe("");
    expect(toTitleCase(null)).toBe("");
    expect(toTitleCase("")).toBe("");
  });

  test("valid", () => {
    expect(toTitleCase("A")).toBe("A");
    expect(toTitleCase("a")).toBe("A");
    expect(toTitleCase("BRIAN")).toBe("Brian");
    expect(toTitleCase("BRIAN brett")).toBe("Brian Brett");
    expect(toTitleCase("ALBERTA'LYN SMITH")).toBe("Alberta'lyn Smith");
    expect(toTitleCase("Alberta'lyn Smith")).toBe("Alberta'lyn Smith");
    expect(toTitleCase("BRENDA SMITH BRAAM")).toBe("Brenda Smith Braam");
    expect(toTitleCase("brenda smith braam")).toBe("Brenda Smith Braam");
    expect(toTitleCase("Mr. BEan 123")).toBe("Mr. Bean 123");
    expect(toTitleCase("Mr. BEan123")).toBe("Mr. Bean123");
    expect(toTitleCase("123 Main ST")).toBe("123 Main St");
    expect(toTitleCase("Mary-JAMES")).toBe("Mary-James");
    expect(toTitleCase("đinh-thư")).toBe("Đinh-Thư");
    expect(toTitleCase("ơ-thư")).toBe("Ơ-Thư");
    expect(toTitleCase("Ơ-Thư")).toBe("Ơ-Thư");
    expect(toTitleCase("ăn liêu")).toBe("Ăn Liêu");
    expect(toTitleCase("enableServiceLinks")).toBe("Enable Service Links");
    expect(toTitleCase("dbchecker")).toBe("Dbchecker");
    expect(toTitleCase("nodeSelector")).toBe("Node Selector");
  });
});

describe("replace last by separator", () => {
  const fn = replaceLastBySeparator;

  test("valid", () => {
    expect(fn("/vi/billing/overview", "account", "/")).toBe(
      "/vi/billing/account",
    );
    expect(fn("/vi/billing", "project", "/")).toBe("/vi/project");
  });

  test("edge cases", () => {
    expect(fn("/hello", "world")).toBe("/world");
    expect(fn("/hello", "world", ".")).toBe("world");
    expect(fn("abc", "oke", "")).toBe("aboke");
  });
});

describe("route matching with dynamic segment", () => {
  const pattern = `/project/${DYNAMIC_ROUTE_SEGMENT}/members`;

  test("valid", () => {
    expect(
      isPatternMatched(pattern, "/project/23832-3213-12313-3213/members"),
    ).toBe(true);
    expect(
      isPatternMatched(
        pattern,
        "/project/23832-3213-12313-3213/members/invite",
      ),
    ).toBe(true);
    expect(
      isPatternMatched(
        pattern,
        "/project/23832-3213-12313-3213/members/233432-4234-24423/edit",
      ),
    ).toBe(true);
  });

  test("invalid", () => {
    expect(isPatternMatched(pattern, "/project//members")).toBe(false);
    expect(isPatternMatched(pattern, "/projectmembers")).toBe(false);
    expect(isPatternMatched(pattern, "/project/members")).toBe(false);
  });
});

describe("replace all placeholder value in path", () => {
  const fn = replacePathPlaceholders;

  const values = {
    projectId: "123-123",
    memberId: "234-234",
  };

  const path1 = "/project/@projectId/member";
  const path2 = "/project/@projectId/member/@memberId";
  const path3 = "/project/@hello/member";

  const expected1 = "/project/123-123/member";
  const expected2 = "/project/123-123/member/234-234";
  const expected3 = "/project/@hello/member";

  test("replace value", () => {
    expect(fn(path1, values)).toBe(expected1);
    expect(fn(path2, values)).toBe(expected2);
    expect(fn(path3, values)).toBe(expected3);
  });
});

describe("convert a string to base 10 integer", () => {
  test("valid inputs", () => {
    expect(base10Int("123")).toBe(123);
    expect(base10Int("45")).toBe(45);
    expect(base10Int("0")).toBe(0);
  });

  test("should return the initial value when input is a valid floating-point number", () => {
    expect(base10Int("45.67", 10)).toBe(45); // floating point number should be ignored
  });

  test("should return the initial value when input is NaN", () => {
    expect(base10Int("abc", 10)).toBe(10);
    expect(base10Int("NaN", 20)).toBe(20);
  });

  test("should return the initial value when input is undefined or null", () => {
    expect(base10Int(undefined, 5)).toBe(5);
    expect(base10Int("", 15)).toBe(15);
  });

  test("should return 0 if no initial value is provided and input is invalid", () => {
    expect(base10Int("abc")).toBe(0);
    expect(base10Int("")).toBe(0);
  });

  test("should handle different types of numeric strings correctly", () => {
    expect(base10Int("0000123")).toBe(123); // leading zeros
    expect(base10Int("   123   ")).toBe(123); // whitespace around number
  });
});

describe("Verify email format with domain", () => {
  test("valid", () => {
    expect(validateDomainEmail("test@example.com", "example.com")).toBe(true);
    expect(validateDomainEmail("user_b@sale.example.com", "example.com")).toBe(
      true,
    );
    expect(
      validateDomainEmail("user_b@office.example.com", "example.com"),
    ).toBe(true);
  });

  test("invalid", () => {
    expect(validateDomainEmail("test@example.com", "company.com")).toBe(false);
    expect(validateDomainEmail("user_b@sale.example.cm", "example.com")).toBe(
      false,
    );
    expect(validateDomainEmail("user_b@office.example.vn", "example.com")).toBe(
      false,
    );
    expect(validateDomainEmail("user_b@office.example.vn", "example.com")).toBe(
      false,
    );
  });
});

describe("truncate text and add ellipsis", () => {
  test("text length > maxLength", () => {
    expect(truncateText("Hello, world!", 5)).toBe("Hello...");
    expect(truncateText("This is a long text", 10)).toBe("This is a ...");
    expect(truncateText("truncate this text", 8)).toBe("truncate...");
  });

  test("text length <= maxLength", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
    expect(truncateText("Short", 10)).toBe("Short");
    expect(truncateText("", 5)).toBe("");
  });

  test("edge cases", () => {
    expect(truncateText("Negative max length", -5)).toBe("...");
    expect(truncateText("Zero max length", 0)).toBe("...");
    expect(truncateText("", 0)).toBe("");
    expect(truncateText("", -10)).toBe("...");
  });
});

describe("snakify string", () => {
  test("should convert camelCase to snake_case", () => {
    expect(snakify("camelCaseExample")).toBe("camel_case_example");
  });

  test("should handle PascalCase correctly", () => {
    expect(snakify("PascalCaseExample")).toBe("pascal_case_example");
  });

  test("should retain existing snake_case", () => {
    expect(snakify("already_snake_case")).toBe("already_snake_case");
  });

  test("should remove special characters", () => {
    expect(snakify("hello@world!test#case")).toBe("helloworldtestcase");
    expect(snakify("test#Case")).toBe("test_case");
  });

  test("should replace spaces with underscores", () => {
    expect(snakify("hello   world  test")).toBe("hello_world_test");
  });

  test("should separate uppercase after lowercase/number", () => {
    expect(snakify("userID99Name")).toBe("user_id99_name");
    expect(snakify("version2XUpdate")).toBe("version2_xupdate");
  });

  test("should separate numbers when param 'separateNumbers' is true", () => {
    expect(snakify("userID99Name", true)).toBe("user_id_99_name");
    expect(snakify("version2XUpdate", true)).toBe("version_2_xupdate");
  });

  test("should not separate numbers when param 'separateNumbers' is false", () => {
    expect(snakify("userID99Name", false)).toBe("user_id99_name");
    expect(snakify("version2XUpdate", false)).toBe("version2_xupdate");
  });

  test("should handle mixed cases with numbers and spaces", () => {
    expect(snakify("MyVariableName 2024")).toBe("my_variable_name_2024");
    expect(snakify("Test123Case")).toBe("test123_case");
  });

  test("should trim leading and trailing underscores", () => {
    expect(snakify("  _TrimMe_  ")).toBe("trim_me");
  });

  test("Trims multiple spaces at the beginning and end", () => {
    expect(snakify("   userID   ")).toBe("user_id");
    expect(snakify("   exampleTest   ")).toBe("example_test");
  });

  test("Removes multiple underscores at the beginning and end", () => {
    expect(snakify("__userID__")).toBe("user_id");
    expect(snakify("___exampleTest___")).toBe("example_test");
  });

  test("Handles both spaces and underscores at the beginning and end", () => {
    expect(snakify("  __userID__  ")).toBe("user_id");
    expect(snakify("__  exampleTest  __")).toBe("example_test");
  });
});

describe("removeVietnameseTones", () => {
  test("edge cases", () => {
    expect(removeVietnameseTones("")).toBe("");
    expect(removeVietnameseTones("    ")).toBe("    ");
    expect(removeVietnameseTones("123")).toBe("123");
    expect(removeVietnameseTones("!@#$%^")).toBe("!@#$%^");
  });

  test("valid", () => {
    expect(removeVietnameseTones("Việt Nam")).toBe("Viet Nam");
    expect(removeVietnameseTones("Đặng Thị Hà")).toBe("Dang Thi Ha");
    expect(removeVietnameseTones("Trần Văn Đoàn")).toBe("Tran Van Doan");
    expect(removeVietnameseTones("hòa bình")).toBe("hoa binh");
    expect(removeVietnameseTones("TÔN THẤT THIỆP")).toBe("TON THAT THIEP");
  });
});

describe("find the last index for which the predicate returns true", () => {
  test("find the last index that matches the predicate", () => {
    const array = [1, 2, 3, 4, 2, 5];
    const predicate = (value: number) => value === 2;
    expect(findLastMatchedIndex(array, predicate)).toBe(4);
  });

  test("returns -1 when no index matches the predicate", () => {
    const array = [1, 2, 3, 4, 5];
    const predicate = (value: number) => value === 6;
    expect(findLastMatchedIndex(array, predicate)).toBe(-1);
  });

  test("empty array", () => {
    const array: number[] = [];
    const predicate = (value: number) => value === 1;
    expect(findLastMatchedIndex(array, predicate)).toBe(-1);
  });

  test("uses array in predicate", () => {
    const array = [1, 2, 3, 4, 5];
    const predicate = (_value: number, _index: number, arr: number[]) =>
      arr.length === 5;
    expect(findLastMatchedIndex(array, predicate)).toBe(4);
  });
});
