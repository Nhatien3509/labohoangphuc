import "server-only";

import { cookies } from "next/headers";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/api/session.constants";

/**
 * Tầng quản lý phiên đăng nhập (server-only).
 *
 * Backend Go trả về { access_token, refresh_token } sau khi login. Ta lưu cả hai
 * vào cookie httpOnly để Server Components / Server Actions đọc lại và gắn vào
 * header `Authorization: Bearer` khi gọi các endpoint cần xác thực.
 *
 * Lưu ý: backend hiện chưa có endpoint refresh token, nên access token thực tế
 * chỉ sống ~15 phút (theo auth_service.go). Khi hết hạn, API admin trả 401 và
 * middleware sẽ điều hướng người dùng về trang đăng nhập.
 */

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

/** Thời gian cookie tồn tại (giây) — bằng vòng đời refresh token của BE: 7 ngày. */
const MAX_AGE = 7 * 24 * 60 * 60;

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

/** Lưu token sau khi đăng nhập thành công. */
export function setSession(tokens: SessionTokens): void {
  const store = cookies();
  const opts = cookieOptions();
  store.set(ACCESS_TOKEN_COOKIE, tokens.access_token, opts);
  store.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, opts);
}

/** Xoá phiên (đăng xuất). */
export function clearSession(): void {
  const store = cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

/** Lấy access token hiện tại (nếu có). */
export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value;
}

/** Có đang đăng nhập hay không (chỉ kiểm tra sự tồn tại của token). */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Giải mã phần payload JWT (không xác thực chữ ký) để lấy thông tin hiển thị
 * như user_id / role. Việc xác thực chữ ký do backend đảm nhiệm.
 */
export interface SessionClaims {
  user_id?: string;
  role?: string;
  exp?: number;
}

export function getSessionClaims(): SessionClaims | null {
  const token = getAccessToken();
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(json) as SessionClaims;
  } catch {
    return null;
  }
}
