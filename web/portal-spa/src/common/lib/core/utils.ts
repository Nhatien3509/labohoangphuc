import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class Tailwind an toàn (clsx + tailwind-merge). Dùng ở mọi component. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
