import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchIfAllowed,
  getCookies,
  getIamHeaders,
  getPathname,
  getRedirectUrl,
  getReturnUrl,
} from "@common/lib/core/server-side";

const mockCookieStore: Record<string, string> = {};
let mockHeadersMap: Record<string, string | null> = {};

vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(() => ({
      get: (name: string) =>
        mockCookieStore[name] !== undefined
          ? { value: mockCookieStore[name] }
          : undefined,
    })),
    headers: vi.fn(() => ({
      get: (name: string) => mockHeadersMap[name] ?? null,
    })),
  };
});

describe("server-utils", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    Object.keys(mockCookieStore).forEach((k) => delete mockCookieStore[k]);
    mockHeadersMap = {};
  });

  // ---------- getCookies ----------
  it("getCookies returns matching cookies", () => {
    mockCookieStore.organizationId = "org-123";
    mockCookieStore.projectId = "proj-456";

    const result = getCookies(["organizationId", "projectId"] as const);

    expect(result.organizationId).toBe("org-123");
    expect(result.projectId).toBe("proj-456");
  });

  it("getCookies returns default value if cookie is missing", () => {
    const result = getCookies(["missingKey"] as const, "default-value");
    expect(result.missingKey).toBe("default-value");
  });

  // ---------- getIamHeaders ----------
  it("getIamHeaders reads organizationId cookie", () => {
    mockCookieStore.organizationId = "org-999";

    const result = getIamHeaders();

    expect(result).toEqual({
      "organization-id": "org-999",
    });
  });

  // ---------- getPathname ----------
  it("getPathname reads x-next-path header", () => {
    mockHeadersMap["x-next-path"] = "/dashboard";

    expect(getPathname()).toBe("/dashboard");
  });

  it("getPathname returns / if header missing", () => {
    expect(getPathname()).toBe("/");
  });

  // ---------- getReturnUrl ----------
  it("getReturnUrl extracts returnUrl param", () => {
    const req = new Request("https://site.com/login?returnUrl=/home");

    expect(getReturnUrl(req)).toBe("/home");
  });

  it("getReturnUrl returns null if missing", () => {
    const req = new Request("https://site.com/login");

    expect(getReturnUrl(req)).toBeNull();
  });

  // ---------- getRedirectUrl ----------
  it("getRedirectUrl preserves returnUrl in final URL", () => {
    const req = new Request("https://app.com?a=1&returnUrl=/abc");

    expect(getRedirectUrl(req, "/oauth/callback")).toBe(
      "/oauth/callback?returnUrl=/abc",
    );
  });

  it("getRedirectUrl returns redirect_uri if no returnUrl", () => {
    const req = new Request("https://app.com");

    expect(getRedirectUrl(req, "/oauth/callback")).toBe("/oauth/callback");
  });

  // ---------- fetchIfAllowed ----------
  it("fetchIfAllowed executes fn if allowed and tab is valid", async () => {
    const fn = vi.fn().mockResolvedValue({ data: "OK" });

    const result = await fetchIfAllowed({
      allowedActions: { view: true },
      action: "view",
      validTab: "settings",
      fn,
      tab: "settings",
    });

    expect(fn).toHaveBeenCalled();
    expect(result).toEqual({ data: "OK" });
  });

  it("fetchIfAllowed returns SUCCESS_200 if not allowed", async () => {
    const fn = vi.fn();

    const result = await fetchIfAllowed({
      allowedActions: { view: false },
      action: "view",
      validTab: null,
      fn,
      tab: "",
    });
    console.log(result);

    expect(fn).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });
});
