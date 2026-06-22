import { type StateCreator, create } from "zustand";
import type { ServiceName } from "@common/lib/core/types";
import { formatDatetime } from "@common/lib/helpers/datetime";
import { persist } from "zustand/middleware";

type RecentlyVisitedServiceStoreProps = {
  serviceName: ServiceName;
  lastAccessed: string;
  serviceUrl: string;
};

type RecentlyVisitedServiceStore = {
  history: RecentlyVisitedServiceStoreProps[];
  add: (serviceName: ServiceName) => void;
  clear: () => void;
  isHydrated: boolean;
  setIsHydrated: (state: boolean) => void;
};

const store: StateCreator<RecentlyVisitedServiceStore> = (set, get) => ({
  history: [],
  isHydrated: false,
  setIsHydrated: (state) => {
    set({
      isHydrated: state,
    });
  },
  add: (serviceName) => {
    const now = formatDatetime(new Date());
    const filtered = get().history.filter((h) => h.serviceName !== serviceName);
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const updated = [
      { serviceName, lastAccessed: now, serviceUrl: currentUrl },
      ...filtered,
    ].slice(0, 10);
    set({ history: updated });
  },
  clear: () => {
    set({ history: [] });
  },
});

export const useRecentlyVisitedService = create<RecentlyVisitedServiceStore>()(
  persist<RecentlyVisitedServiceStore>(store, {
    name: "recently-visited-services",
    onRehydrateStorage: (state) => {
      return () => {
        state.setIsHydrated(true);
      };
    },
  }),
);
