import { format, parseISO } from "date-fns";

/** Định dạng ngày YYYY-MM-DD (chuỗi BE) -> DD/MM/YYYY hiển thị. */
export function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

/** Chuyển Date -> chuỗi ISO date YYYY-MM-DD để gửi BE. */
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
