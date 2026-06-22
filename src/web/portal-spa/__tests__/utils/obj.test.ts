import type { CSSObjectWithLabel, GroupBase, OptionProps } from "react-select";
import {
  buildQueryString,
  getBackgroundColor,
  getOptionSchema,
  pickProps,
  snakifyObject,
} from "@common/lib/helpers/obj";
import { describe, expect, test } from "vitest";
import type { OptionType } from "@common/lib/core/types";
import { z } from "zod";

describe("getOptionSchema", () => {
  const message = "required";

  test("valid option without raw", () => {
    const schema = getOptionSchema(message);

    const input = {
      value: "id-1",
      label: "Endpoint A",
    };

    const result = schema.parse(input);

    expect(result).toEqual(input);
  });

  test("valid option with raw object", () => {
    type RawType = { id: string; name: string };

    const schema = getOptionSchema<RawType>(message);

    const input = {
      value: "id-1",
      label: "Endpoint A",
      raw: {
        id: "id-1",
        name: "Endpoint A",
      },
    };

    const result = schema.parse(input);

    expect(result).toEqual(input);
  });

  test("trim value and label", () => {
    const schema = getOptionSchema(message);

    const input = {
      value: "  id-1  ",
      label: "  Endpoint A  ",
    };

    const result = schema.parse(input);

    expect(result).toEqual({
      value: "id-1",
      label: "Endpoint A",
    });
  });

  test("throw error when value is empty", () => {
    const schema = getOptionSchema(message);

    const input = {
      value: "",
      label: "Endpoint A",
    };

    expect(() => schema.parse(input)).toThrow(z.ZodError);
  });

  test("throw error when label is empty", () => {
    const schema = getOptionSchema(message);

    const input = {
      value: "id-1",
      label: "",
    };

    expect(() => schema.parse(input)).toThrow(z.ZodError);
  });

  test("raw is optional", () => {
    const schema = getOptionSchema(message);

    const input = {
      value: "id-1",
      label: "Endpoint A",
      raw: undefined,
    };

    const result = schema.parse(input);

    expect(result.raw).toBeUndefined();
  });
});

describe("filter headers using pick util function", () => {
  const headers = new Headers([
    ["Content-Type", "application/json"],
    ["user-agent", "Mozilla/5.0 (X11; Linux x86_64)"],
    ["accept-encoding", "gzip, deflate, br"],
    ["x-forwarded-proto", "http"],
    ["x-forwarded-host", "localhost:3000"],
  ]);

  const picked = pickProps(Object.fromEntries(headers), [
    "content-type",
    "user-agent",
    "x-real-ip",
  ]);

  const expected = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64)",
  };

  test("correct header", () => {
    expect(JSON.stringify(picked)).toEqual(JSON.stringify(expected));
  });
});

describe("build query string from params object", () => {
  const fn = buildQueryString;

  test("valid", () => {
    expect(
      fn({
        tax_code: "123",
        company: "imaginary",
      }),
    ).toBe("?tax_code=123&company=imaginary");
  });

  test("with numeric values", () => {
    expect(
      fn({
        name: "name",
        age: 16,
        grade: 10,
      }),
    ).toBe(`?name=name&age=16&grade=10`);
  });

  test("with long string", () => {
    expect(
      fn({
        foo: "2",
        long_string: "This is a long string",
        baz: 1,
      }),
    ).toBe(`?foo=2&long_string=This+is+a+long+string&baz=1`);

    expect(
      fn({
        long_string: "string with comma .",
      }),
    ).toBe(`?long_string=string+with+comma+.`);
  });

  test("with array value", () => {
    expect(
      fn({
        colors: ["red", "blue", "green"],
        name: "hello",
        age: 19,
      }),
    ).toBe(`?colors=red&colors=blue&colors=green&name=hello&age=19`);

    expect(
      fn({
        colors: [],
        name: "hello",
        age: 19,
      }),
    ).toBe(`?name=hello&age=19`);
  });

  test("with camelcase keys, snakify", () => {
    expect(
      fn(
        {
          pageSize: 5,
          userId: "13241",
          directAccess: true,
        },
        true,
      ),
    ).toBe("?page_size=5&user_id=13241&direct_access=true");
  });

  test("with camelcase keys, no snakify", () => {
    expect(
      fn({
        pageSize: 5,
        userId: "13241",
        directAccess: true,
      }),
    ).toBe("?pageSize=5&userId=13241&directAccess=true");
  });
});

describe("snakify an object", () => {
  test("null or undefined", () => {
    expect(snakifyObject()).toBeUndefined();
    expect(snakifyObject(null)).toBeNull();
  });

  test("should return the same primitive value if input is not an object", () => {
    expect(snakifyObject(123)).toBe(123);
    expect(snakifyObject("helloWorld")).toBe("helloWorld");
    expect(snakifyObject(true)).toBe(true);
  });

  test("should convert object keys from camelCase to snake_case", () => {
    const input = {
      userName: "JohnDoe",
      userAge: 30,
      isAdmin: true,
    };

    const expected = {
      user_name: "JohnDoe",
      user_age: 30,
      is_admin: true,
    };

    expect(snakifyObject(input)).toEqual(expected);
  });

  test("should handle nested objects and convert their keys to snake_case", () => {
    const input = {
      userProfile: {
        firstName: "John",
        lastName: "Doe",
        accountDetails: {
          accountBalance: 1000,
          lastLoginDate: "2024-03-12",
        },
      },
    };

    const expected = {
      user_profile: {
        first_name: "John",
        last_name: "Doe",
        account_details: {
          account_balance: 1000,
          last_login_date: "2024-03-12",
        },
      },
    };

    expect(snakifyObject(input)).toEqual(expected);
  });

  test("should handle objects with array values", () => {
    const input = {
      userList: [
        { userName: "Alice", userAge: 25 },
        { userName: "Bob", userAge: 28 },
      ],
    };

    const expected = {
      user_list: [
        { user_name: "Alice", user_age: 25 },
        { user_name: "Bob", user_age: 28 },
      ],
    };

    expect(snakifyObject(input)).toEqual(expected);
  });

  test("should handle arrays of objects", () => {
    const input = [
      { firstName: "Alice", lastName: "Smith" },
      { firstName: "Bob", lastName: "Johnson" },
    ];

    const expected = [
      { first_name: "Alice", last_name: "Smith" },
      { first_name: "Bob", last_name: "Johnson" },
    ];

    expect(snakifyObject(input)).toEqual(expected);
  });

  test("should leave objects with snake_case keys unchanged", () => {
    const input1 = {
      already_snake_case: "value",
      nested_object: {
        another_key: "test",
      },
    };

    const expected1 = {
      already_snake_case: "value",
      nested_object: {
        another_key: "test",
      },
    };

    const input2 = {
      enableIpv4: false,
      enableIpv6: true,
    };

    const expected2 = {
      enable_ipv4: false,
      enable_ipv6: true,
    };

    expect(snakifyObject(input1)).toEqual(expected1);
    expect(snakifyObject(input2)).toEqual(expected2);
  });

  test("should ignore functions and return them as-is", () => {
    const testFunction = () => "Hello";

    const input = {
      methodName: testFunction,
    };

    const expected = {
      method_name: testFunction,
    };

    expect(snakifyObject(input)).toEqual(expected);
  });

  test("should not modify an empty object", () => {
    expect(snakifyObject({})).toEqual({});
  });

  test("should not modify an empty array", () => {
    expect(snakifyObject([])).toEqual([]);
  });

  test("should preserve keys that are already snake_case with x_ prefix", () => {
    const input = {
      name: "test-listener",
      set_x_forwarded_for: true,
      set_x_forwarded_port: false,
      set_x_forwarded_proto: true,
    };

    const expected = {
      name: "test-listener",
      set_x_forwarded_for: true,
      set_x_forwarded_port: false,
      set_x_forwarded_proto: true,
    };

    expect(snakifyObject(input)).toEqual(expected);
  });
});

type TestGroup = GroupBase<OptionType>;

// Helper tạo OptionProps với đúng type, chỉ set các field mình cần
const createOptionProps = (flags?: {
  isFocused?: boolean;
  isSelected?: boolean;
}): OptionProps<OptionType, false, TestGroup> =>
  ({
    isFocused: flags?.isFocused ?? false,
    isSelected: flags?.isSelected ?? false,
  }) as OptionProps<OptionType, false, TestGroup>;

const createBase = (backgroundColor: string): CSSObjectWithLabel => ({
  backgroundColor,
});

describe("getBackgroundColor", () => {
  test("trả về màu focus khi option đang được focus", () => {
    const base = createBase("var(--neutral-0)");
    const props = createOptionProps({ isFocused: true, isSelected: false });

    const result = getBackgroundColor<OptionType, false, TestGroup>(
      base,
      props,
    );

    expect(result).toBe("var(--primary-50)");
  });

  test("trả về màu selected khi option được chọn và không focus", () => {
    const base = createBase("var(--neutral-0)");
    const props = createOptionProps({ isFocused: false, isSelected: true });

    const result = getBackgroundColor<OptionType, false, TestGroup>(
      base,
      props,
      "var(--my-selected-color)",
    );

    expect(result).toBe("var(--my-selected-color)");
  });

  test("ưu tiên màu focus hơn màu selected khi vừa focus vừa selected", () => {
    const base = createBase("var(--neutral-0)");
    const props = createOptionProps({ isFocused: true, isSelected: true });

    const result = getBackgroundColor<OptionType, false, TestGroup>(
      base,
      props,
      "var(--my-selected-color)",
    );

    // isFocused được check trước nên phải trả về màu focus
    expect(result).toBe("var(--primary-50)");
  });

  test("dùng màu selected mặc định khi không truyền isSelectedColor", () => {
    const base = createBase("var(--neutral-0)");
    const props = createOptionProps({ isFocused: false, isSelected: true });

    const result = getBackgroundColor<OptionType, false, TestGroup>(
      base,
      props,
    );

    expect(result).toBe("var(--neutral-0)");
  });

  test("trả về backgroundColor gốc khi không focus và không selected", () => {
    const base = createBase("var(--neutral-200)");
    const props = createOptionProps({ isFocused: false, isSelected: false });

    const result = getBackgroundColor<OptionType, false, TestGroup>(
      base,
      props,
    );

    expect(result).toBe("var(--neutral-200)");
  });
});
