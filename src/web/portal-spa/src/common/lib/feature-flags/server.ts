import { type FeatureKey, config } from "@common/lib/feature-flags/config";

export type FeatureFlags = Record<FeatureKey, boolean>;

export const flattenFeatureConfig = (
  node: unknown,
  parent = "",
): Record<string, boolean> => {
  if (typeof node === "boolean") {
    return parent ? { [parent]: node } : {};
  }

  if (typeof node !== "object" || node === null) {
    return {};
  }

  const result: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(node)) {
    const fullKey = parent ? `${parent}.${key}` : key;
    Object.assign(result, flattenFeatureConfig(value, fullKey));
  }

  return result;
};

// -----------------------------
// Initialize feature flags
// -----------------------------
const featureFlags: FeatureFlags = (() => {
  const flat = flattenFeatureConfig(config);
  return flat as FeatureFlags;
})();

// -----------------------------
// Access helpers
// -----------------------------
export function getFeatureFlags(key: FeatureKey): boolean;
export function getFeatureFlags(keys: FeatureKey[]): boolean[];
export function getFeatureFlags(input: FeatureKey | FeatureKey[]) {
  if (typeof input === "string") return featureFlags[input];
  return input.map((k) => featureFlags[k]);
}

export const getInitialFeatureFlags = (): FeatureFlags => featureFlags;
