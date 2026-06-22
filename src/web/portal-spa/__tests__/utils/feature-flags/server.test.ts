import {
  type FeatureFlags,
  flattenFeatureConfig,
  getFeatureFlags,
  getInitialFeatureFlags,
} from "@common/lib/feature-flags/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@common/lib/feature-flags/config", () => ({
  config: {
    themSwitch: {
      enabled: true,
    },
    billing: {
      costAnalysis: true,
      hasProjectBillingPlan: true,
      hasProjectPaygSubscription: true,
    },
    iam: {
      enabled: true,
    },
    pat: {
      enabled: true,
    },
    logs: {
      enabled: true,
    },
    useBasicAuth: {
      enabled: true,
    },
    monitoring: {
      enabled: true,
    },
    debugLogs: {
      enabled: true,
    },
    cloudObservability: {
      enabled: true,
    },
    vke: {
      enabled: true,
    },
    vpn: {
      enabled: true,
    },
    server: {
      liveResize: true,
    },
    network: {
      shareVPC: true,
    },
    objectStorage: {
      dataSyncJob: true,
      dataSyncConfig: true,
    },
    dms: {
      enabled: true,
    },
    kms: {
      enabled: true,
    },
  },
}));

import { type FeatureKey, config } from "@common/lib/feature-flags/config";

describe("feature-flags/server", () => {
  it("flattenFeatureConfig() flattens correctly", () => {
    const flat = flattenFeatureConfig(config);

    // vài key đại diện
    expect(flat["network.shareVPC"]).toBeTypeOf("boolean");
    expect(flat["objectStorage.dataSyncJob"]).toBeTypeOf("boolean");
    expect(flat["vpn.enabled"]).toBeTypeOf("boolean");

    // tất cả key đều trả boolean
    Object.values(flat).forEach((v) => {
      expect(typeof v).toBe("boolean");
    });
  });

  it("getFeatureFlags(key) returns correct boolean", () => {
    const flags = getInitialFeatureFlags();

    for (const key in flags) {
      const typedKey = key as FeatureKey;
      expect(getFeatureFlags(typedKey)).toBe(flags[typedKey]);
    }
  });

  it("getFeatureFlags([keys]) returns boolean array", () => {
    const result = getFeatureFlags([
      "objectStorage.dataSyncJob",
      "objectStorage.dataSyncConfig",
    ]);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result.every((v) => typeof v === "boolean")).toBe(true);
  });

  it("FeatureFlags type matches flattened config", () => {
    const flags: FeatureFlags = getInitialFeatureFlags();

    // số key bằng số key flatten
    const flat = flattenFeatureConfig(config);

    expect(Object.keys(flags)).toEqual(Object.keys(flat));
  });

  it("FeatureKey enforces correct types", () => {
    // VALID
    getFeatureFlags("network.shareVPC");

    // ❌ INVALID — compile-level errors
    // @ts-expect-error invalid key
    getFeatureFlags("network.invalid");

    // @ts-expect-error invalid path
    getFeatureFlags(["invalid.path"]);
  });
});
