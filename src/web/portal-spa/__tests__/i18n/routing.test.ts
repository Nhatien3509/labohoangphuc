import { describe, expect, test } from "vitest";
import { locales, routing } from "@/common/lib/i18n/routing";

describe("routing config", () => {
  test("localePrefix is configured as 'never'", () => {
    const localePrefix = routing.localePrefix;
    const mode =
      typeof localePrefix === "string" ? localePrefix : localePrefix?.mode;
    expect(mode).toBe("never");
  });

  test("locales and default locale", () => {
    expect(locales).toContain("vi");
    expect(locales).toContain("en");
    expect(routing.defaultLocale).toBe("vi");
  });
});
