export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import {
  type SessionData,
  clientConfig,
  getClient,
  getSession,
} from "@common/lib/core/auth";
import { BASE_PATH } from "@common/lib/core/const";
import { generators } from "openid-client";
import { getRedirectUrl } from "@common/lib/core/server-side";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession<SessionData>("session");

    if (session.isLoggedIn) {
      return Response.redirect(clientConfig.post_login_route);
    }

    session.code_verifier = generators.codeVerifier();
    await session.save();

    const code_challenge = generators.codeChallenge(session.code_verifier);
    const client = await getClient();
    const url = client.authorizationUrl({
      scope: clientConfig.scope,
      audience: clientConfig.audience,
      redirect_uri: getRedirectUrl(req, clientConfig.redirect_uri),
      code_challenge,
      code_challenge_method: "S256",
      __tenant: session.tenantId,
    });

    return Response.redirect(url);
  } catch (error) {
    console.error("Error in Login handler:", error);

    // Redirect tương đối về /login, tránh đẩy người dùng ra trang 404 khi flow
    // đăng nhập lỗi (route `server-errors` không tồn tại).
    return new NextResponse(null, {
      status: 307,
      headers: { Location: `${BASE_PATH}/login` },
    });
  }
}
