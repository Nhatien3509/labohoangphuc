import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeParams(
  params: Record<string, string | number>,
  targetKey = "size",
): Record<string, string | number> {
  const newParams = { ...params };

  if (
    newParams.filterBy === targetKey &&
    newParams.searchValue &&
    !/^\d+$/.test(String(newParams.searchValue))
  ) {
    newParams[targetKey] = "0";
  }

  return newParams;
}
