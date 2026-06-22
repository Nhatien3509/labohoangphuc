import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { base10Int } from "@common/lib/helpers/str";

export const useQueryParams = <
  T extends Record<string, string | number | string[]>,
>(
  defaultParams: T,
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [isPending, startTransition] = useTransition();

  const getParams = () => {
    const result: Record<string, string | number | string[]> = {};

    Object.keys(defaultParams).forEach((key) => {
      const defaultValue = searchParams.get(key) ?? defaultParams[key] ?? "";
      const value = params.getAll(key);

      if (Array.isArray(defaultParams[key])) {
        result[key] = value.length > 0 ? value : defaultValue;
        return;
      }

      if (key === "page") {
        const pageValue = base10Int(value[0], Number(defaultValue));
        result[key] = pageValue < 1 ? 1 : pageValue;
        return;
      }

      result[key] =
        typeof defaultParams[key] === "number"
          ? base10Int(value[0], Number(defaultValue))
          : (value[0] ?? defaultValue);
    });

    return result as T;
  };

  const updateParams = useCallback(
    (
      newParams: Partial<Record<keyof T, string | string[] | number | null>>,
    ) => {
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
          return;
        }
        if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((val) => {
            params.append(key, val);
          }); // TODO: max 40 projects case
        } else {
          params.set(key, String(value).trim());
        }
      });

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },

    [params],
  );

  const clearParams = useCallback(() => {
    if (params.size === 0) {
      return;
    }

    Object.keys(defaultParams).forEach((key) => {
      if (key !== "pageSize") params.delete(key);
    });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [params, pathname, router, defaultParams]);

  return {
    getParams,
    updateParams,
    clearParams,
    isPending,
  };
};
