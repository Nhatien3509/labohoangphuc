"use client";

import { type FeatureKey } from "@common/lib/feature-flags/config";
import { useFeatureFlagStore } from "@common/stores/FeatureFlagStoreProvider";

export function useFeatureFlag(key: FeatureKey): boolean {
  return useFeatureFlagStore((s) => s.flags[key]);
}

export function useFeatureFlags(keys: FeatureKey[]): boolean[] {
  return useFeatureFlagStore((s) => keys.map((k) => s.flags[k]));
}
