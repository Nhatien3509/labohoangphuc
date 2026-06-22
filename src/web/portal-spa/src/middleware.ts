import type {
  AccessTokenData,
  RefreshTokenData,
  SessionData,
} from "@common/lib/core/auth";
import { type NextRequest, NextResponse } from "next/server";
import { getIronSession, sealData } from "iron-session";
import { BASE_PATH } from "@common/lib/core/const";
import { accessTokenExpiresAt } from "@common/lib/core/token";
import createMiddleware from "next-intl/middleware";
import { env } from "@/env";
import { getFeatureFlags } from "@common/lib/feature-flags/server";
import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { routing } from "@/common/lib/i18n/routing";

const publicRoutes = [
  "/login",
  "/signin",
  "/server-errors",
  "/marketplace",
  "/basic-auth",
];
const cookiePassword = env.COOKIES_PASSWORD;
const useBasicAuth = getFeatureFlags("useBasicAuth.enabled");
const COOKIE_TTL_SECONDS = 60 * 60 * 24;
const BACKEND_REFRESH_ENDPOINT = `${env.BACKEND_URL}/api/v1/auth/refresh`;
const COOKIE_SECURE = env.ORIGIN_URL.startsWith("https");
const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/" as const,
  secure: COOKIE_SECURE,
};

function isRefreshTokenExpired(refreshToken: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(refreshToken);
    return !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

function addLocaleToPathname(pathname: string, locale: string) {
  if (!pathname.startsWith(BASE_PATH)) return pathname;

  const localeRegex = /\/(en|vi)(?=\/|$)/;
  const trimmedPath = pathname.replace(new RegExp(`^${BASE_PATH}`), "");

  if (localeRegex.test(trimmedPath)) {
    return pathname;
  }

  return `${BASE_PATH}/${locale}${trimmedPath}`;
}

function createLogoutRedirect(req: NextRequest) {
  const locale = headers().get("x-next-intl-locale") ?? "vi";
  const pathnameWithLocale = addLocaleToPathname(req.nextUrl.pathname, locale);
  const returnUrl = encodeURIComponent(
    `${req.nextUrl.origin}${pathnameWithLocale}${req.nextUrl.search}`,
  );
  return NextResponse.redirect(
    `${env.ORIGIN_URL}${BASE_PATH}/auth/logout?returnUrl=${returnUrl}`,
  );
}

export default async function middleware(req: NextRequest, res: NextResponse) {
  const { pathname } = new URL(req.url);
  const isPublicRoute = publicRoutes.some((route) => pathname.includes(route));
  const normalizedPathname = pathname.replace(
    new RegExp(`^${BASE_PATH}(?=/)`),
    "",
  );
  const isApiOrStatic = /^(\/api|\/auth|\/_next|\/_vercel|.*\..*)/.test(
    normalizedPathname,
  );

  const response = createMiddleware(routing)(req);
  response.headers.set("x-next-path", pathname);

  if (isApiOrStatic) return NextResponse.next();

  const [session, refreshToken, accessToken] = await Promise.all([
    getIronSession<SessionData>(req, res, {
      cookieName: "session",
      password: cookiePassword,
    }),
    getIronSession<RefreshTokenData>(req, res, {
      cookieName: "refreshToken",
      password: cookiePassword,
    }),
    getIronSession<AccessTokenData>(req, res, {
      cookieName: "accessToken",
      password: cookiePassword,
    }),
  ]);

  if (isPublicRoute && !session.isLoggedIn) return response;

  if (env.BYPASS_AUTH && !session.isLoggedIn) {
    const returnUrl = `${env.ORIGIN_URL}${pathname}${req.nextUrl.search}`;
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    return NextResponse.redirect(
      `${env.ORIGIN_URL}${BASE_PATH}/auth/auto-login?returnUrl=${encodedReturnUrl}`,
    );
  }

  if (useBasicAuth && !session.isLoggedIn) {
    return NextResponse.redirect(`${env.ORIGIN_URL}${BASE_PATH}/basic-auth`);
  }

  if (session.isLoggedIn && session.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at <= now) {
      if (
        !refreshToken.refresh_token ||
        isRefreshTokenExpired(refreshToken.refresh_token)
      ) {
        return createLogoutRedirect(req);
      }
      if (!accessToken.access_token) {
        return createLogoutRedirect(req);
      }

      try {
        const tokenResponse = await fetch(BACKEND_REFRESH_ENDPOINT, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            authorization: `Bearer ${accessToken.access_token}`,
          },
          body: JSON.stringify({
            refreshToken: refreshToken.refresh_token,
          }),
        });

        if (!tokenResponse.ok) {
          return createLogoutRedirect(req);
        }

        const refreshed = (await tokenResponse.json()) as {
          access_token?: string;
          accessToken?: string;
          refresh_token?: string;
          refreshToken?: string;
        };
        const accessTokenValue =
          refreshed.access_token ?? refreshed.accessToken;
        const refreshTokenValue =
          refreshed.refresh_token ?? refreshed.refreshToken;

        if (!accessTokenValue) {
          return createLogoutRedirect(req);
        }

        // expires_at bám theo `exp` thật của access token JWT mới (BE sinh lại
        // với JWT_EXPIRES_IN) để lần refresh kế tiếp diễn ra TRƯỚC khi token chết.
        session.expires_at = accessTokenExpiresAt(accessTokenValue);

        const sealedSession = await sealData(session, {
          password: cookiePassword,
          ttl: COOKIE_TTL_SECONDS,
        });
        const sealedAccess = await sealData(
          { access_token: accessTokenValue },
          { password: cookiePassword, ttl: COOKIE_TTL_SECONDS },
        );
        const sealedRefresh = await sealData(
          { refresh_token: refreshTokenValue ?? refreshToken.refresh_token },
          { password: cookiePassword, ttl: COOKIE_TTL_SECONDS },
        );

        response.cookies.set("session", sealedSession, cookieOptions);
        response.cookies.set("accessToken", sealedAccess, cookieOptions);
        response.cookies.set("refreshToken", sealedRefresh, cookieOptions);
      } catch (error) {
        console.error("Token refresh failed:", error);
        return createLogoutRedirect(req);
      }
    }
  }

  if (!session.isLoggedIn) {
    return createLogoutRedirect(req);
  }

  return response;
}
