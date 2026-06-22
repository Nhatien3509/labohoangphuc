export const dynamic = "force-dynamic";

import {
  type AccessTokenData,
  COOKIE_SECURE,
  ORIGIN_URL_WITH_BASE_PATH,
  type RefreshTokenData,
  type SessionData,
  clientConfig,
  getClient,
  getSession,
} from "@common/lib/core/auth";
import { getRedirectUrl, getReturnUrl } from "@common/lib/core/server-side";
import { BASE_PATH } from "@common/lib/core/const";
import type { IncomingMessage } from "http";
import type { NextRequest } from "next/server";
import { OAUTH_ERROR_HANDLERS } from "@common/lib/core/errors";
import { ROUTES } from "@common/lib/core/routes";
import { setCookies } from "@common/lib/core/server-actions";

export async function GET(request: NextRequest) {
  try {
    const returnUrl = getReturnUrl(request);
    const redirectUrl = getRedirectUrl(request, clientConfig.redirect_uri);

    const [session, accessToken, refreshToken] = await Promise.all([
      getSession<SessionData>("session"),
      getSession<AccessTokenData>("accessToken"),
      getSession<RefreshTokenData>("refreshToken"),
    ]);

    if (!session.code_verifier) {
      const loginUrl = returnUrl
        ? ROUTES.auth.loginReturnUrl(returnUrl)
        : ROUTES.auth.login;
      return Response.redirect(`${ORIGIN_URL_WITH_BASE_PATH}${loginUrl}`);
    }

    if (session.isLoggedIn) {
      return Response.redirect(clientConfig.post_login_route);
    }

    const client = await getClient();
    const params = client.callbackParams(request as unknown as IncomingMessage);
    const tokenResponse = await client.callback(redirectUrl, params, {
      code_verifier: session.code_verifier,
    });

    const userinfo = await client.userinfo(tokenResponse);

    Object.assign(accessToken, {
      access_token: tokenResponse.access_token ?? "",
    });
    Object.assign(refreshToken, {
      refresh_token: tokenResponse.refresh_token ?? "",
    });
    if (userinfo.sub !== session.user?.sub) {
      await setCookies({
        projectId: "",
      });
    }
    Object.assign(session, {
      isLoggedIn: true,
      id_token: tokenResponse.id_token,
      expires_at: tokenResponse.expires_at,
      state: tokenResponse.session_state,
      user: {
        sub: userinfo.sub,
        name: userinfo.name ?? "",
        email: userinfo.email ?? "",
        email_verified: userinfo.email_verified ?? false,
        locale: userinfo.locale,
      },
    });
    const currentLocale = session.user?.locale ?? "vi";

    await Promise.all([
      session.save(),
      accessToken.save(),
      refreshToken.save(),
      setCookies(
        {
          NEXT_LOCALE: currentLocale,
        },
        {
          secure: COOKIE_SECURE,
          httpOnly: true,
          overwrite: true,
          path: BASE_PATH,
        },
      ),
    ]);

    const localeRegex = /\/(vi|en)(?=\/|$)/;
    const updatedReturnUrl = (returnUrl ?? "").replace(
      localeRegex,
      `/${currentLocale}`,
    );

    return Response.redirect(returnUrl ? updatedReturnUrl : redirectUrl);
  } catch (error) {
    console.error("Error in Login handler:", error);
    const client = await getClient();
    const params = client.callbackParams(request as unknown as IncomingMessage);

    const handler = OAUTH_ERROR_HANDLERS[String(params.error)];
    if (handler) {
      return handler();
    }

    // Flow callback lỗi → về /login thay vì route `server-errors` không tồn tại
    // (vốn bị catch-all render thành trang 404).
    return Response.redirect(`${ORIGIN_URL_WITH_BASE_PATH}/login`);
  }
}
