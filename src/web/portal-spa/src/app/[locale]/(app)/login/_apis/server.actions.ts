"use server";

import {
  type AccessTokenData,
  type RefreshTokenData,
  type SessionData,
  type SsoUserInfo,
  getSession,
} from "@common/lib/core/auth";
import { accessTokenExpiresAt } from "@common/lib/core/token";
import { env } from "@/env";
import { jwtDecode } from "jwt-decode";

interface SsoModule {
  code: string;
  name: string;
  permissions?: { code: string; name: string }[];
}

interface SsoLoginResponse {
  access_token: string;
  refresh_token: string;
  user: SsoUserInfo;
  modules?: SsoModule[];
  groups?: { code: string; name: string }[];
}

/**
 * Mã quyền lấy từ body response BE: `modules[].permissions[].code` (format mới
 * `{module}:{action}`). Fallback: BE cũ nhúng permissions trong JWT lồng
 * `sso_access_token` (format cũ) — dùng tạm trong giai đoạn chuyển đổi.
 */
function extractPermissions(data: SsoLoginResponse): string[] {
  const fromModules = (data.modules ?? []).flatMap((m) =>
    (m.permissions ?? []).map((p) => p.code),
  );
  if (fromModules.length > 0) return fromModules;
  try {
    const { sso_access_token } = jwtDecode<{ sso_access_token?: string }>(
      data.access_token,
    );
    if (!sso_access_token) return [];
    const { permissions } = jwtDecode<{ permissions?: string[] }>(
      sso_access_token,
    );
    return permissions ?? [];
  } catch (error) {
    console.error("[login] extract permissions failed:", error);
    return [];
  }
}

export interface SsoLoginResult {
  success: boolean;
  error?: string;
}

// Đăng nhập SSO trực tiếp: gọi admin-service, lưu internal-JWT + session.
export async function signInWithSso(
  username: string,
  password: string,
): Promise<SsoLoginResult> {
  if (!username || !password) {
    return { success: false, error: "Thiếu tên đăng nhập hoặc mật khẩu" };
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${env.BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    console.error("SSO login error:", error);
    return { success: false, error: "Không thể kết nối máy chủ" };
  }

  if (!beRes.ok) {
    const errBody = (await beRes.json().catch(() => null)) as {
      error?: string;
    } | null;
    return {
      success: false,
      error: errBody?.error ?? "Tên đăng nhập hoặc mật khẩu không đúng",
    };
  }

  const data = (await beRes.json()) as SsoLoginResponse;

  const permissions = extractPermissions(data);

  // [DEBUG] Toàn bộ data login + format mã quyền token (module:action mới hay
  // VIEW_USER cũ). Log ở terminal server (Next dev). Gỡ sau khi xác nhận.
  console.log("[login] data:", JSON.stringify(data, null, 2));
  console.log("[login] permissions:", JSON.stringify(permissions));
  console.log("[login] groups:", JSON.stringify(data.groups ?? []));

  const [session, accessToken, refreshToken] = await Promise.all([
    getSession<SessionData>("session"),
    getSession<AccessTokenData>("accessToken"),
    getSession<RefreshTokenData>("refreshToken"),
  ]);
  Object.assign(accessToken, { access_token: data.access_token });
  Object.assign(refreshToken, { refresh_token: data.refresh_token });
  Object.assign(session, {
    isLoggedIn: true,
    // expires_at bám theo `exp` thật của access token JWT (trừ buffer) để
    // middleware refresh TRƯỚC khi token chết — không hardcode 1h như trước.
    expires_at: accessTokenExpiresAt(data.access_token),
    user: {
      sub: data.user.username,
      name: data.user.fullName || data.user.username,
      email: data.user.email,
      email_verified: true,
      locale: "vi",
    },
    ssoUser: data.user,
    permissions,
    groups: data.groups ?? [],
  });

  await Promise.all([session.save(), accessToken.save(), refreshToken.save()]);

  return { success: true };
}
