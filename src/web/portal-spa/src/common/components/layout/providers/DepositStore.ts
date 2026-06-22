import { type StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

export type CheckoutSubscriptionState = {
  addedToCartCategories: Record<string, boolean>;
  selectedByCategory: Record<string, string | null>;
  quantities: Record<string, number>;
  autoRenew: boolean;
  isAgreement: boolean;
  isResettingBillingCycle: boolean;
};

type DepositStoreProps = {
  isRedirect?: boolean;
  depositData?: Record<string, unknown>;
  currentPage?: string;
  insufficientBalance?: boolean;
  isUpdateBalance?: boolean;
  currentPageData?: CheckoutSubscriptionState | Record<string, unknown>;
};

type DepositStore = {
  depositInfo: DepositStoreProps;
  clear: () => void;
  isHydrated: boolean;
  setIsHydrated: (state: boolean) => void;
  updateKey: (payload: Partial<DepositStoreProps>) => void;
};

const store: StateCreator<DepositStore> = (set) => ({
  depositInfo: {},
  isHydrated: false,
  setIsHydrated: (state) => {
    set({
      isHydrated: state,
    });
  },
  clear: () => {
    set({ depositInfo: {} });
  },
  updateKey: (payload) => {
    set((state) => ({
      depositInfo: {
        ...state.depositInfo,
        ...payload,
      },
    }));
  },
});

export const useRecentDepositInfo = create<DepositStore>()(
  persist<DepositStore>(store, {
    name: "recently-deposit-info",
    onRehydrateStorage: (state) => {
      return () => {
        state.setIsHydrated(true);
      };
    },
  }),
);
