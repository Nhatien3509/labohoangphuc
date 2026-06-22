import { ROUTES, withLocale } from "@common/lib/core/routes";
import { describe, expect, test } from "vitest";
import { REDIRECT_RULES } from "@/common/lib/core/redirects";
import { UUID_REGEX } from "@common/lib/core/const";

const UUID_PATTERN = UUID_REGEX.source.slice(1, -1);

describe("redirect rules", () => {
  test("iam home -> rootOverview", () => {
    const rule = REDIRECT_RULES.find(
      (r) => r.source === withLocale(ROUTES.iam.home),
    );

    expect(rule).toBeDefined();
    expect(rule?.destination).toBe(withLocale(ROUTES.iam.rootOverview));
    expect(rule?.permanent).toBe(true);
  });

  test("iam directoryId redirect", () => {
    const source = `${withLocale(
      ROUTES.iam.home,
    )}/:directoryId(${UUID_PATTERN})`;

    const rule = REDIRECT_RULES.find((r) => r.source === source);

    expect(rule).toBeDefined();
    expect(rule?.destination).toBe(
      withLocale(ROUTES.iam.directoryOverview(":directoryId")),
    );
  });

  test("cloudServer home -> management", () => {
    const rule = REDIRECT_RULES.find(
      (r) => r.source === withLocale(ROUTES.cloudServer.home),
    );

    expect(rule?.destination).toBe(withLocale(ROUTES.cloudServer.management));
  });

  test("network vpc details", () => {
    const source = `${withLocale(ROUTES.network.vpcs)}/:vpcId(${UUID_PATTERN})`;

    const rule = REDIRECT_RULES.find((r) => r.source === source);

    expect(rule?.destination).toBe(
      withLocale(ROUTES.network.vpcDetails(":vpcId")),
    );
  });

  test("vpn strongwan id redirect", () => {
    const source = `${withLocale(
      ROUTES.vpn.strongwan,
    )}/:strongwanId(${UUID_PATTERN})`;

    const rule = REDIRECT_RULES.find((r) => r.source === source);

    expect(rule?.destination).toBe(
      withLocale(ROUTES.vpn.strongwanDetails(":strongwanId")),
    );
  });

  test("all rules are permanent", () => {
    REDIRECT_RULES.forEach((rule) => {
      expect(rule.permanent).toBe(true);
    });
  });

  test("no duplicate source", () => {
    const sources = REDIRECT_RULES.map((r) => r.source);
    const unique = new Set(sources);

    expect(unique.size).toBe(sources.length);
  });
});
