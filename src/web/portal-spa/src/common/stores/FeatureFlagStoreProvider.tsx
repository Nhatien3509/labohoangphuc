"use client";

import type { FeatureFlags } from "@common/lib/feature-flags/server";
import { createStore } from "zustand";
import { createStoreContext } from "@common/stores/StoreProvider";

export type FeatureFlagState = {
  flags: FeatureFlags;
};

const createFeatureFlagStore = (initialState: FeatureFlagState) =>
  createStore<FeatureFlagState>()(() => initialState);

export const {
  StoreProvider: FeatureFlagStoreProvider,
  useStoreContext: useFeatureFlagStore,
} = createStoreContext<FeatureFlagState>(createFeatureFlagStore);
