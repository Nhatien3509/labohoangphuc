import { BASE_PATH } from "@common/lib/core/const";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { sealData } from "iron-session";

export const dynamic = "force-dynamic";

const ONE_DAY_SECONDS = 60 * 60 * 24;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(req: Request) {
  if (!env.BYPASS_AUTH) {
    return new NextResponse("Not found", { status: 404 });
  }

  const returnUrl =
    new URL(req.url).searchParams.get("returnUrl") ??
    `${env.ORIGIN_URL}${BASE_PATH}`;

  const sessionData = {
    isLoggedIn: true,
    expires_at: Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS,
    user: {
      sub: "dev-user",
      name: "Dev User",
      email: "dev@localhost",
      email_verified: true,
      locale: "vi",
    },
  };

  const [sealedSession, sealedAccess, sealedRefresh] = await Promise.all([
    sealData(sessionData, {
      password: env.COOKIES_PASSWORD,
      ttl: ONE_DAY_SECONDS,
    }),
    sealData(
      { access_token: "dev-token" },
      { password: env.COOKIES_PASSWORD, ttl: ONE_DAY_SECONDS },
    ),
    sealData(
      { refresh_token: "dev-refresh-token" },
      { password: env.COOKIES_PASSWORD, ttl: ONE_DAY_SECONDS },
    ),
  ]);

  const response = NextResponse.redirect(returnUrl);
  response.cookies.set("session", sealedSession, cookieOptions);
  response.cookies.set("accessToken", sealedAccess, cookieOptions);
  response.cookies.set("refreshToken", sealedRefresh, cookieOptions);
  return response;
}
