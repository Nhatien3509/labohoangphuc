import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/api/session.constants";
import { env } from "@/env";

/**
 * Bảo vệ khu quản trị + tự động làm mới access token (Edge runtime).
 *
 * - Access token còn hạn  -> cho qua.
 * - Access token hết hạn nhưng còn refresh token -> gọi BE /auth/refresh, ghi
 *   cặp token mới vào cookie (cho cả request hiện tại lẫn response trả về).
 * - Không có/không refresh được -> điều hướng về /login.
 *
 * Đây là nơi duy nhất trong luồng điều hướng có thể GHI cookie (Server Components
 * chỉ đọc được), nên việc refresh đặt ở middleware để mọi điều hướng đều liền mạch.
 */

const REFRESH_SKEW_SECONDS = 30;

/** Giải mã exp trong payload JWT (không xác thực chữ ký). true nếu hết hạn/không hợp lệ. */
function isExpired(token: string): boolean {
  const parts = token.split(".");
  if (parts.length < 2) return true;
  try {
    let b64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    b64 += "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    if (!payload.exp) return true;
    const nowSec = Date.now() / 1000;
    return payload.exp - REFRESH_SKEW_SECONDS <= nowSec;
  } catch {
    return true;
  }
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  const res = NextResponse.redirect(url);
  res.cookies.delete(ACCESS_TOKEN_COOKIE);
  res.cookies.delete(REFRESH_TOKEN_COOKIE);
  return res;
}

async function refreshTokens(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const base = env.BACKEND_URL.replace(/\/+$/, "");
    const r = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const envelope = (await r.json()) as {
      success: boolean;
      data: { access_token: string; refresh_token: string } | null;
    };
    if (!envelope.success || !envelope.data) return null;
    return envelope.data;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const access = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (access && !isExpired(access)) {
    return NextResponse.next();
  }

  if (refresh) {
    const tokens = await refreshTokens(refresh);
    if (tokens) {
      // Cập nhật cookie cho request hiện tại để Server Components đọc token mới...
      req.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token);
      req.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token);
      const res = NextResponse.next({ request: { headers: req.headers } });
      // ...và ghi cookie mới về trình duyệt.
      const opts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      };
      res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, opts);
      res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, opts);
      return res;
    }
  }

  return redirectToLogin(req);
}

export const config = {
  matcher: ["/admin/:path*"],
};
