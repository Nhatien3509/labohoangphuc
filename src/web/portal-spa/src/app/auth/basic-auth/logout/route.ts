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
    accessToken.destroy();
    refreshToken.destroy();
    session.isLoggedIn = false;
    await session.save();

    return NextResponse.redirect(`${env.ORIGIN_URL}${BASE_PATH}/basic-auth`);
  } catch (error) {
    console.error("Logout error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
