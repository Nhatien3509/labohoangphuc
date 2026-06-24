/**
 * Cấu hình môi trường tập trung. Đọc 1 lần, fail-fast nếu thiếu biến bắt buộc.
 * Bản gốc portal-spa dùng @t3-oss/env-nextjs + zod; ở skeleton này giữ tối giản.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export const env = {
  /** URL gốc backend Go, KHÔNG kèm /api/v1 (đã ghép trong api/instance.ts). */
  BACKEND_URL,
} as const;
