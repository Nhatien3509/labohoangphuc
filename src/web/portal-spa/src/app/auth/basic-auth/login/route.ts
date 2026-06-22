import {
  type AccessTokenData,
  COOKIE_SECURE,
  type RefreshTokenData,
  type SessionData,
  getSession,
} from "@common/lib/core/auth";
import { BASE_PATH } from "@common/lib/core/const";
import { NextResponse } from "next/server";
import { setCookies } from "@common/lib/core/server-actions";

export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json()) as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return new NextResponse("Missing username or password", { status: 400 });
    }

    const credentials = Buffer.from(`${username}:${password}`).toString(
      "base64",
    );

    // 🧠 Lưu session bằng iron-session
    const [session, accessToken, refreshToken] = await Promise.all([
      getSession<SessionData>("session"),
      getSession<AccessTokenData>("accessToken"),
      getSession<RefreshTokenData>("refreshToken"),
    ]);
    Object.assign(accessToken, {
      access_token: credentials,
    });
    Object.assign(refreshToken, {
      refresh_token: credentials,
    });
    await setCookies({
      projectId: "",
    });
    Object.assign(session, {
      isLoggedIn: true,
      user: {
        sub: username,
        name: username,
        email: username,
        email_verified: true,
        locale: "vi",
      },
    });

    await Promise.all([
      session.save(),
      accessToken.save(),
      refreshToken.save(),
      setCookies(
        {
          NEXT_LOCALE: "vi",
        },
        {
          secure: COOKIE_SECURE,
          httpOnly: true,
          overwrite: true,
          path: BASE_PATH,
        },
      ),
    ]);

    return NextResponse.json({
      message: "Login success",
      user: session.user,
    });
  } catch (error) {
    console.error("Basic auth login error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
