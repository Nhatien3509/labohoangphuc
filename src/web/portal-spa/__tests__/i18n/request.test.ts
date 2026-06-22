import { beforeEach, describe, expect, it, vi } from "vitest";

type HeaderMap = Record<string, string>;
let mockHeadersMap: HeaderMap = {};

// Mock thư viện của Next.js
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    entries: () => Object.entries(mockHeadersMap)[Symbol.iterator](),
  })),
}));

vi.mock("next-intl/server", () => ({
  getRequestConfig: <T>(factory: T) => factory,
}));

// Mock trực tiếp các file JSON sẽ được gọi qua dynamic import()
vi.mock("@/common/lib/_messages/en.json", () => ({
  default: { greeting: "Hello" },
}));
vi.mock("@/common/lib/_messages/vi.json", () => ({ default: { ok: true } }));
vi.mock("@/app/[locale]/network/_messages/vi.json", () => ({
  default: { key: "value" },
}));
vi.mock("@/app/[locale]/vpn/_messages/vi.json", () => ({
  default: { region: "ap-southeast" },
}));

const importRequestModule = async () => import("@/common/lib/i18n/request");

describe("i18n request", () => {
  beforeEach(() => {
    vi.resetModules();
    mockHeadersMap = { "x-next-intl-locale": "vi" };
  });

  it("throws when namespace is empty after trim", async () => {
    const { loadMessages } = await importRequestModule();

    await expect(loadMessages("   ")).rejects.toThrow(
      "i18n message namespace is required",
    );
  });

  it("loads common messages from common folder with header locale", async () => {
    mockHeadersMap = { "x-next-intl-locale": "en" };

    const { loadMessages } = await importRequestModule();
    const messages = await loadMessages("common");

    expect(messages).toEqual({ greeting: "Hello" });
  });

  it("falls back to default locale when header locale is unsupported", async () => {
    mockHeadersMap = { "x-next-intl-locale": "fr" };

    const { loadMessages } = await importRequestModule();
    const messages = await loadMessages("network");

    expect(messages).toEqual({ key: "value" });
  });

  it("returns cached messages natively for same locale and namespace", async () => {
    mockHeadersMap = { "x-next-intl-locale": "vi" };

    const { loadMessages } = await importRequestModule();
    const first = await loadMessages("vpn");
    const second = await loadMessages("vpn");

    expect(first).toBe(second);
  });

  it("returns empty object and logs error when import fails", async () => {
    mockHeadersMap = { "x-next-intl-locale": "vi" };
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => ({}));

    const { loadMessages } = await importRequestModule();

    const messages = await loadMessages("not-exist-namespace");

    expect(messages).toEqual({});

    consoleSpy.mockRestore();
  });

  it("builds request config with validated locale and loaded messages", async () => {
    mockHeadersMap = { "x-next-intl-locale": "en" };

    const requestModule = await importRequestModule();
    const getRequest = requestModule.default as (params: {
      requestLocale: Promise<string | null | undefined>;
    }) => Promise<{
      locale: string;
      messages: Record<string, unknown>;
    }>;

    const result = await getRequest({ requestLocale: Promise.resolve("en") });

    expect(result.locale).toBe("en");
    expect(result.messages.layout).toEqual({ greeting: "Hello" });
  });

  it("uses default locale when request locale is unsupported", async () => {
    mockHeadersMap = { "x-next-intl-locale": "vi" };

    const requestModule = await importRequestModule();
    const getRequest = requestModule.default as (params: {
      requestLocale: Promise<string | null | undefined>;
    }) => Promise<{
      locale: string;
      messages: Record<string, unknown>;
    }>;

    const result = await getRequest({ requestLocale: Promise.resolve("fr") });

    expect(result.locale).toBe("vi");
    expect(result.messages.layout).toEqual({ ok: true });
  });
});
