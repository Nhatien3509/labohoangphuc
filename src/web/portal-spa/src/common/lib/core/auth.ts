import {
  type IronSession,
  type SessionOptions,
  getIronSession,
} from "iron-session";
import { BASE_PATH } from "@common/lib/core/const";
import { Issuer } from "openid-client";
import { cookies } from "next/headers";
import { env } from "@/env";

export const ORIGIN_URL_WITH_BASE_PATH = `${env.ORIGIN_URL}${BASE_PATH}`;

// Chỉ bật cờ Secure khi origin công khai là HTTPS. Trên hạ tầng HTTP
// (vd http://<ip>:8800) trình duyệt sẽ loại bỏ cookie Secure → mất session
// sau khi đăng nhập. Localhost vẫn chấp nhận Secure nên dev không bị ảnh hưởng.
export const COOKIE_SECURE = env.ORIGIN_URL.startsWith("https");

export const clientConfig = {
  url: env.KEYCLOAK_ISSUER,
  audience: env.KEYCLOAK_ISSUER,
  client_id: env.KEYCLOAK_CLIENT_ID,
  scope: env.KEYCLOAK_SCOPE,
  redirect_uri: `${ORIGIN_URL_WITH_BASE_PATH}/auth/openiddict`,
  post_logout_redirect_uri: `${ORIGIN_URL_WITH_BASE_PATH}/login`,
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: ORIGIN_URL_WITH_BASE_PATH,
};

export interface SsoUserInfo {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  position: string;
  positionName: string;
  accountType: string;
  accountTypeName: string;
  unitCode: string;
  unitName: string;
  idNo: string;
  idIssuePlace: string;
}

export interface SessionData {
  isLoggedIn: boolean;
  id_token?: string;
  code_verifier?: string;
  expires_at?: number;
  state?: string;
  tenantId?: string;
  user?: {
    sub: string;
    name: string;
    email: string;
    email_verified: boolean;
    locale: "en" | "vi";
  };
  ssoUser?: SsoUserInfo;
  /** Mã quyền (permission code) trích từ JWT lúc đăng nhập. */
  permissions?: string[];
  /** Nhóm quyền của user, vd `[{ code: "ADMIN", name: "Quản trị viên" }]`. */
  groups?: { code: string; name: string }[];
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export interface AccessTokenData {
  access_token: string;
}

export interface RefreshTokenData {
  refresh_token: string;
}

export async function getSession<T extends object>(
  cookieName: string,
  ttl = 60 * 60 * 24,
): Promise<IronSession<T>> {
  const sessionOptions: SessionOptions = {
    cookieName,
    password: env.COOKIES_PASSWORD,
    ttl,
    cookieOptions: { secure: COOKIE_SECURE },
  };
  return getIronSession<T>(cookies(), sessionOptions);
}

/** Mã quyền của user đăng nhập (đọc từ session). Rỗng nếu chưa đăng nhập. */
export async function getCurrentPermissions(): Promise<string[]> {
  const { permissions } = await getSession<SessionData>("session");
  return permissions ?? [];
}

export async function getClient() {
  const issuer = await Issuer.discover(clientConfig.url);
  return new issuer.Client({
    client_id: clientConfig.client_id,
    response_types: ["code"],
    redirect_uris: [clientConfig.redirect_uri],
    token_endpoint_auth_method: "none",
  });
}
