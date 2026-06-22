export const dynamic = "force-dynamic";

import {
  type AccessTokenData,
  type RefreshTokenData,
  type SessionData,
  clientConfig,
  getClient,
  getSession,
} from "@common/lib/core/auth";
import { type NextRequest, NextResponse } from "next/server";
import { BASE_PATH } from "@common/lib/core/const";
import { generators } from "openid-client";
import { getRedirectUrl } from "@common/lib/core/server-side";

// Redirect tương đối về trang đăng nhập — trình duyệt tự ghép host hiện tại,
// tránh dính host bind của server (vd 0.0.0.0:3000) khi chạy sau proxy.
function loginRedirect() {
  return new NextResponse(null, {
    status: 307,
    headers: { Location: `${BASE_PATH}/login` },
  });
}

export async function GET(req: NextRequest) {
  try {
    const [session, accessToken, refreshToken] = await Promise.all([
      getSession<SessionData>("session"),
      getSession<AccessTokenData>("accessToken"),
      getSession<RefreshTokenData>("refreshToken"),
    ]);
    const redirectUrl = getRedirectUrl(
      req,
      clientConfig.post_logout_redirect_uri,
    );
    if (!session.isLoggedIn) {
      return Response.redirect(redirectUrl);
    }

    const idToken = session.id_token;

    accessToken.destroy();
    refreshToken.destroy();
    session.isLoggedIn = false;
    await session.save();

    // Phiên timeout thường không còn id_token hợp lệ → Keycloak sẽ từ chối
    // endSessionUrl. Bỏ qua SSO logout, chỉ clear cookie + về /login.
    if (!idToken) {
      return Response.redirect(redirectUrl);
    }

    // Lỗi Keycloak (discovery/endSession) KHÔNG được kéo cả flow về trang lỗi —
    // người dùng đã đăng xuất cục bộ nên vẫn đưa về /login.
    try {
      const client = await getClient();
      const endSession = client.endSessionUrl({
        post_logout_redirect_uri: redirectUrl,
        id_token_hint: idToken,
        state: generators.state(),
      });
      return Response.redirect(endSession);
    } catch (ssoError) {
      console.error("Logout SSO end-session error:", ssoError);
      return Response.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Logout Error:", error);

    // Hết phiên (timeout) không được đẩy người dùng ra trang 404/lỗi — luôn về
    // trang đăng nhập.
    return loginRedirect();
  }
}
