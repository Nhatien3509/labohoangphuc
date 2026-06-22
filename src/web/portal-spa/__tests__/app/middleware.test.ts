import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { getFeatureFlags } from "@common/lib/feature-flags/server";
import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { sealData } from "iron-session";

// 1. Dùng import type chuẩn để không bị dính lỗi linter consistent-type-imports
import type {
  AccessTokenData,
  RefreshTokenData,
  SessionData,
} from "@common/lib/core/auth";
import type MiddlewareType from "@/middleware";

let mockIntlResponse = new NextResponse();

vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => vi.fn(() => mockIntlResponse)),
}));

let mockSessionData: Partial<SessionData> & {
  isLoggedIn?: boolean;
  expires_at?: number;
} = {};
let mockRefreshTokenData: Partial<RefreshTokenData> & {
  refresh_token?: string;
} = {};
let mockAccessTokenData: Partial<AccessTokenData> & {
  access_token?: string;
} = {};

vi.mock("iron-session", () => ({
  getIronSession: vi.fn((_req, _res, { cookieName }) => {
    if (cookieName === "session") return mockSessionData;
    if (cookieName === "refreshToken") return mockRefreshTokenData;
    if (cookieName === "accessToken") return mockAccessTokenData;
    return {};
  }),
  sealData: vi.fn().mockResolvedValue("mocked-sealed-data"),
}));

vi.mock("@common/lib/feature-flags/server", () => ({
  getFeatureFlags: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: {
    COOKIES_PASSWORD: "super-secret-password-at-least-32-chars-long",
    KEYCLOAK_CLIENT_ID: "test-client",
    KEYCLOAK_ISSUER: "https://keycloak.test",
    KEYCLOAK_SCOPE: "openid profile",
    ORIGIN_URL: "https://myapp.com",
  },
}));

vi.mock("@common/lib/core/const", () => ({
  BASE_PATH: "/base",
}));

vi.mock("@common/i18n/routing", () => ({
  routing: { locales: ["en", "vi"] },
}));

// --- 2. TESTS ---
describe("Middleware", () => {
  let headersSetSpy: MockInstance;
  let cookiesSetSpy: MockInstance;
  let nextSpy: MockInstance;
  let redirectSpy: MockInstance;
  let fetchSpy: MockInstance;

  // 2. Sử dụng Type đã import
  let middleware: typeof MiddlewareType;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockIntlResponse = new NextResponse();
    headersSetSpy = vi.spyOn(mockIntlResponse.headers, "set");
    cookiesSetSpy = vi.spyOn(mockIntlResponse.cookies, "set");
    nextSpy = vi.spyOn(NextResponse, "next");
    redirectSpy = vi.spyOn(NextResponse, "redirect");

    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response());

    mockSessionData = { isLoggedIn: false };
    mockRefreshTokenData = { refresh_token: "mock-refresh-token" };
    mockAccessTokenData = { access_token: "mock-access-token" };

    // 3. SỬA LỖI TẠI ĐÂY: Trả về false thuần túy (dùng as never để bypass Linter nếu cần)
    vi.mocked(getFeatureFlags).mockReturnValue(false as never);
    vi.mocked(headers).mockReturnValue(
      new Headers({ "x-next-intl-locale": "en" }),
    );

    const mod = await import("@/middleware");
    middleware = mod.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createReq = (url: string) => new NextRequest(url);
  const createRes = () => new NextResponse();

  it("1. Should return NextResponse.next() for API or static routes", async () => {
    const req = createReq("https://myapp.com/base/api/users");
    const res = await middleware(req, createRes());

    expect(nextSpy).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("2. Should return next-intl response for public routes when NOT logged in", async () => {
    const req = createReq("https://myapp.com/base/signin");
    mockSessionData = { isLoggedIn: false };

    const res = await middleware(req, createRes());

    expect(headersSetSpy).toHaveBeenCalledWith("x-next-path", "/base/signin");
    expect(res).toBe(mockIntlResponse);
  });

  it("3. Should redirect to basic-auth if useBasicAuth=true and NOT logged in", async () => {
    vi.resetModules();
    // Trả về true cho các case Basic Auth
    vi.mocked(getFeatureFlags).mockReturnValue(true as never);

    const { default: dynamicMiddleware } = await import("@/middleware");

    mockSessionData = { isLoggedIn: false };
    const req = createReq("https://myapp.com/base/dashboard");

    const res = await dynamicMiddleware(req, createRes());

    expect(redirectSpy).toHaveBeenCalledWith(
      "https://myapp.com/base/basic-auth",
    );
    expect(res.headers.get("location")).toBe(
      "https://myapp.com/base/basic-auth",
    );
  });

  it("4. Should return response if useBasicAuth=true and Logged In", async () => {
    vi.resetModules();
    vi.mocked(getFeatureFlags).mockReturnValue(true as never);

    const { default: dynamicMiddleware } = await import("@/middleware");

    mockSessionData = { isLoggedIn: true };
    const req = createReq("https://myapp.com/base/dashboard");

    const res = await dynamicMiddleware(req, createRes());
    expect(res).toBe(mockIntlResponse);
  });

  it("5. Should redirect to logout if NOT logged in (Standard Auth)", async () => {
    mockSessionData = { isLoggedIn: false };
    const req = createReq("https://myapp.com/base/dashboard?query=1");

    const encodedUrl = encodeURIComponent(
      "https://myapp.com/base/en/dashboard?query=1",
    );
    const expectedLogoutUrl = `https://myapp.com/base/auth/logout?returnUrl=${encodedUrl}`;

    const res = await middleware(req, createRes());

    expect(redirectSpy).toHaveBeenCalledWith(expectedLogoutUrl);
    expect(res.headers.get("location")).toBe(expectedLogoutUrl);
  });

  it("6. Should proceed normally if Token is valid and NOT expiring soon", async () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    mockSessionData = { isLoggedIn: true, expires_at: futureTime };
    const req = createReq("https://myapp.com/base/dashboard");

    const res = await middleware(req, createRes());

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(res).toBe(mockIntlResponse);
  });

  describe("Token Refresh Logic", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 100;
    const futureTime = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(() => {
      mockSessionData = { isLoggedIn: true, expires_at: pastTime };
    });

    it("7. Should redirect to logout if refresh token is expired (isExpired = true)", async () => {
      vi.mocked(jwtDecode).mockReturnValue({ exp: pastTime });
      const req = createReq("https://myapp.com/base/dashboard");

      const res = await middleware(req, createRes());

      expect(jwtDecode).toHaveBeenCalledWith("mock-refresh-token");
      expect(res.headers.get("location")).toContain("/auth/logout");
    });

    it("8. Should redirect to logout if decoding refresh token throws error", async () => {
      vi.mocked(jwtDecode).mockImplementation(() => {
        throw new Error("Invalid token");
      });
      const req = createReq("https://myapp.com/base/dashboard");

      const res = await middleware(req, createRes());

      expect(res.headers.get("location")).toContain("/auth/logout");
    });

    it("9. Should call fetch and redirect if API returns !ok", async () => {
      vi.mocked(jwtDecode).mockReturnValue({ exp: futureTime });

      const errorResponse = new Response(
        JSON.stringify({ error: "invalid_grant" }),
        { status: 400, statusText: "Bad Request" },
      );
      fetchSpy.mockResolvedValue(errorResponse);

      const req = createReq("https://myapp.com/base/dashboard");
      const res = await middleware(req, createRes());

      expect(fetchSpy).toHaveBeenCalled();
      expect(res.headers.get("location")).toContain("/auth/logout");
    });

    it("10. Should call fetch and redirect if fetch throws exception", async () => {
      vi.mocked(jwtDecode).mockReturnValue({ exp: futureTime });
      fetchSpy.mockRejectedValue(new Error("Network Error"));

      const req = createReq("https://myapp.com/base/dashboard");
      const res = await middleware(req, createRes());

      expect(res.headers.get("location")).toContain("/auth/logout");
    });

    it("11. Should refresh token successfully, set cookies and return response", async () => {
      vi.mocked(jwtDecode).mockReturnValue({ exp: futureTime });

      const successResponse = new Response(
        JSON.stringify({
          access_token: "new-access",
          refresh_token: "new-refresh",
          expires_in: 3600,
        }),
        { status: 200, statusText: "OK" },
      );
      fetchSpy.mockResolvedValue(successResponse);

      const req = createReq("https://myapp.com/base/dashboard");
      const res = await middleware(req, createRes());

      expect(sealData).toHaveBeenCalledTimes(3);
      expect(cookiesSetSpy).toHaveBeenCalledTimes(3);
      expect(res).toBe(mockIntlResponse);
    });
  });

  describe("addLocaleToPathname helper", () => {
    it("12. Should return original pathname if it doesn't start with basePath", async () => {
      const req = createReq("https://myapp.com/other-path?query=1");
      mockSessionData = { isLoggedIn: false };

      const res = await middleware(req, createRes());
      expect(res.headers.get("location")).toContain(
        encodeURIComponent("https://myapp.com/other-path?query=1"),
      );
    });

    it("13. Should preserve existing locale in pathname", async () => {
      const req = createReq("https://myapp.com/base/vi/dashboard?query=1");
      mockSessionData = { isLoggedIn: false };

      const res = await middleware(req, createRes());
      expect(res.headers.get("location")).toContain(
        encodeURIComponent("https://myapp.com/base/vi/dashboard?query=1"),
      );
    });
  });
});
