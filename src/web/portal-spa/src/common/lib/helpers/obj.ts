import type { CSSObjectWithLabel, GroupBase, OptionProps } from "react-select";
import type { OptionType } from "@common/lib/core/types";
import { SENSITIVE_KEYS } from "@common/lib/core/const";
import { snakify } from "@common/lib/helpers/str";
import { z } from "zod";

export type RecursiveObject = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | RecursiveObject
    | Array<RecursiveObject>;
};

// Eg: obj = {a: 'hello', b: 'world'} => pick(obj, ['a']) = {a: 'hello'}
export const pickProps = (obj: Record<string, unknown>, keys: string[]) => {
  const res: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) res[key] = obj[key];
  }

  return res;
};

/**
 * Take an object, return query string like `?foo=1&baz=2&str=this+is+string&arr=1&arr=2&arr=3`
 *
 * @param queryParams Object
 * @param  snakeCase Option to turn query param to snake case in the proccess.
 * @returns {String} query string
 */

export function buildQueryString(
  queryParams: Record<string, string | number | boolean | (string | number)[]>,
  snakeCase = false,
) {
  // Little bit or type casting is needed to satisfy Typescript.
  // Under the hood the URLSearchParams methods coerce values into string
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    const transformedKey =
      snakeCase && !key.includes("__") ? snakify(key) : key;

    if (Array.isArray(value)) {
      for (const val of value) {
        urlSearchParams.append(transformedKey, val as string);
      }
    } else {
      urlSearchParams.append(transformedKey, value as string);
    }
  }

  return `?${urlSearchParams.toString()}`;
}

export const getAllPaths = (obj: RecursiveObject, currentPath = "") => {
  let paths: string[] = [];

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      paths.push(newPath);

      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: RecursiveObject, index: string | number) => {
            const arrayPath = `${newPath}.${index}`;
            paths.push(arrayPath);
            paths = paths.concat(getAllPaths(item, arrayPath));
          });
        } else {
          paths = paths.concat(getAllPaths(obj[key], newPath));
        }
      }
    }
  }

  return paths;
};

export const getBackgroundColor = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  base: CSSObjectWithLabel,
  options: OptionProps<Option, IsMulti, Group>,
  isSelectedColor = "var(--neutral-0)",
): string => {
  if (options.isFocused) {
    return "var(--primary-50)";
  }
  if (options.isSelected) {
    return isSelectedColor;
  }
  return base.backgroundColor as string;
};

export function objectToFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof Blob || typeof value === "string") {
      formData.append(key, value);
    } else if (value === null || value === undefined) {
      formData.append(key, "");
    }
  });

  return formData;
}

export function snakifyObject(obj?: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => snakifyObject(item));
  }

  const typedObj = obj as Record<string, unknown>;
  return Object.keys(typedObj).reduce<Record<string, unknown>>((acc, key) => {
    const snakeKey = snakify(key);
    acc[snakeKey] = snakifyObject(typedObj[key]);
    return acc;
  }, {});
}

export function pascalifyObject(obj?: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => pascalifyObject(item));
  }

  const typedObj = obj as Record<string, unknown>;
  return Object.keys(typedObj).reduce<Record<string, unknown>>((acc, key) => {
    const pascalKey = key ? key.charAt(0).toUpperCase() + key.slice(1) : key;
    acc[pascalKey] = pascalifyObject(typedObj[key]);
    return acc;
  }, {});
}

export const customFilterOption = (option: OptionType, inputValue: string) => {
  return option.label.toLowerCase().includes(inputValue.toLowerCase());
};

export const getBooleanOptionSchema = (message?: string) => {
  return z.object(
    {
      value: z.boolean({ message }),
      label: z.string().trim().min(1, { message }),
    },
    { message },
  );
};

export const getOptionSchema = <TRaw = unknown>(message?: string) => {
  return z.object(
    {
      value: z.string().trim().min(1, { message }),
      label: z.string().trim().min(1, { message }),
      raw: z.custom<TRaw>().optional(),
    },
    { message },
  );
};

export function sanitizeObject(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const clone = { ...(data as Record<string, unknown>) };

  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = "***";
    } else if (typeof clone[key] === "object" && clone[key] !== null) {
      clone[key] = sanitizeObject(clone[key]);
    }
  }

  return clone;
}
