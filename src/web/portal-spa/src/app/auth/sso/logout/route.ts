import {
  type AccessTokenData,
  type RefreshTokenData,
  type SessionData,
  getSession,
} from "@common/lib/core/auth";
import { BASE_PATH } from "@common/lib/core/const";
import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
  try {
    const [session, accessToken, refreshToken] = await Promise.all([
      getSession<SessionData>("session"),
      getSession<AccessTokenData>("accessToken"),
      getSession<RefreshTokenData>("refreshToken"),
    ]);

    // Báo admin-service thu hồi token (best-effort — không chặn logout nếu lỗi)
    if (accessToken.access_token && refreshToken.refresh_token) {
      try {
        await fetch(`${env.BACKEND_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.access_token}`,
          },
          cache: "no-store",
          body: JSON.stringify({ refreshToken: refreshToken.refresh_token }),
        });
      } catch (err) {
        console.error("SSO logout (backend) error:", err);
      }
    }

    accessToken.destroy();
    refreshToken.destroy();
    session.isLoggedIn = false;
    await session.save();

    // Redirect tương đối — trình duyệt tự ghép với host đang đứng, tránh
    // dính host bind của server (vd 0.0.0.0:3000) khi chạy sau proxy.
    return new NextResponse(null, {
      status: 307,
      headers: { Location: `${BASE_PATH}/login` },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
