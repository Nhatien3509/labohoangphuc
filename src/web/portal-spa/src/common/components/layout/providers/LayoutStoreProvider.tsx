"use client";

import type { FieldValues, UseFormTrigger } from "react-hook-form";
import {
  type Organization,
  type Project,
  type Region,
  type User,
  type Zone,
  defaultOrg,
} from "@/api/common/types";
import type { AbstractIntlMessages } from "next-intl";
import type { ButtonProps } from "@common/components/ui/button";
import type { FetchResult } from "@/api/types";
import type { InfoDialogProps } from "@common/components/containers/dialogs/BaseDialogContainer";
import type { ReactNode } from "react";
import { SUCCESS_200 } from "@common/lib/core/const";
import { createStore } from "zustand";

type Service = { id: string; name: string; [key: string]: unknown };
type Category = Record<string, unknown>;
type FavoriteService = { id: string; service: string };
type ProjectMember = { id: string; role: string; username?: string };
type ServiceInfo = { name: string; homeHref?: string };

// Stubs for removed modules
type BillingAccount = Record<string, unknown>;
type VPC = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  cidr: string;
  region: string;
  owner: string;
  project: string;
  createdAt: Date;
  updatedAt: string;
  routeTables: string[];
  internetAccess: boolean;
};
import { createStoreContext } from "@/common/stores/StoreProvider";
import { env } from "@/env";
import { setCookies } from "@common/lib/core/server-actions";

type EnvURLKey = "DOCS_URL" | "CONSOLE_URL" | "CONTAINER_REGISTRY_URL";

type LayoutDialogType =
  | "coming_soon"
  | "subscription"
  | "create_project"
  | "project_required";

type LayoutDialogStateMap = {
  coming_soon: {
    isOpen: boolean;
    serviceName?: string;
  };
  subscription: {
    isOpen: boolean;
    title?: string;
    description?: string;
  };
  create_project: {
    isOpen: boolean;
    onSuccess?: (project?: Project) => void;
    setIsOpenProjectManagement?: React.Dispatch<React.SetStateAction<boolean>>;
  };
  project_required: {
    isOpen: boolean;
    onSuccess?: () => void;
    isOpenProjectManagement?: boolean;
    setIsOpenProjectManagement?: React.Dispatch<React.SetStateAction<boolean>>;
  };
};

type LayoutState = GlobalDialogState & {
  isNavigating: boolean;
  isRefreshing: boolean;
  isGlobalLoading: boolean;
  isLoggedIn: boolean;
  url: Record<EnvURLKey, string>;
  messages: AbstractIntlMessages;
  currentUser?: User;
  currentMember?: ProjectMember;
  currentProject?: Project;
  currentOrg: Organization;
  allowedActions: Set<string>;
  services: Service[];
  categories: Category[];
  favoriteServices: FavoriteService[];
  layoutDialogStates: {
    [K in LayoutDialogType]: LayoutDialogStateMap[K];
  };
  isNotFound?: boolean;
  launchingServices: ServiceInfo[];
  billingAccount: BillingAccount | null;
  currentProjectBillingAccount: BillingAccount | null;
  projects: Project[];
  regions: Region[];
  vpcs: VPC[];
  zones: Zone[];
};

type LayoutActions = GlobalDialogActions & {
  setIsNavigating: (isNavigating: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  showGlobalLoading: () => void;
  hideGlobalLoading: () => void;
  updateCurrentProject: (currentProject?: Project) => Promise<void>;
  updateCurrentMember: (currentMember?: ProjectMember) => void;
  updateCurrentOrg: (currentOrg: Organization) => void;
  updateFavoriteServices: (favoriteServices: FavoriteService[]) => void;
  t: (key: string) => string;
  updateLayoutDialogState: (
    data: Partial<{
      [K in LayoutDialogType]: Partial<LayoutDialogStateMap[K]>;
    }>,
  ) => void;

  updateKey: <K extends keyof Omit<LayoutState, "updateKey">>(
    key: K,
    value: LayoutState[K],
  ) => void;
};
export type LayoutStore = LayoutState & LayoutActions;

const initDialogState: GlobalDialogState = {
  formData: {},
  formTrigger: null,
  dialogProps: {
    isOpen: false,
    cancelText: "",
    title: "",
    dialogContent: null,
  },
  dialogButtonState: {
    isValid: true,
    isLoading: false,
    buttonProps: {},
    callbackAPI: () => {
      return Promise.resolve({ status: 200, success: true });
    },
  },
  dialogContentData: {
    key: "",
    data: null,
  },
};

const MIN_GLOBAL_LOADING_MS = 1500;

let globalLoadingCount = 0;
let globalLoadingStartedAt = 0;
let globalLoadingTimer: ReturnType<typeof setTimeout> | null = null;

const createLayoutStore = (
  initState: LayoutState = {
    isNavigating: false,
    isRefreshing: false,
    isGlobalLoading: false,
    isLoggedIn: false,
    messages: {},
    services: [],
    categories: [],
    favoriteServices: [],
    currentOrg: defaultOrg,
    allowedActions: new Set(),
    layoutDialogStates: {
      coming_soon: { isOpen: false },
      subscription: { isOpen: false },
      create_project: { isOpen: false },
      project_required: { isOpen: false },
    },
    url: {
      DOCS_URL: env.DOCS_URL,
      CONSOLE_URL: env.CONSOLE_URL,
      CONTAINER_REGISTRY_URL: env.CONTAINER_REGISTRY_URL,
    },
    launchingServices: [],
    billingAccount: null,
    currentProjectBillingAccount: null,
    projects: [],
    regions: [],
    vpcs: [],
    zones: [],
    ...initDialogState,
  },
) =>
  createStore<LayoutStore>()((set, get) => ({
    ...initState,
    ...initDialogState,
    setIsNavigating: (isNavigating) => {
      set(() => ({ isNavigating }));
    },
    setIsRefreshing: (isRefreshing) => {
      set(() => ({ isRefreshing }));
    },
    showGlobalLoading: () => {
      if (globalLoadingTimer) {
        clearTimeout(globalLoadingTimer);
        globalLoadingTimer = null;
      }
      if (globalLoadingCount === 0) {
        globalLoadingStartedAt = Date.now();
        set(() => ({ isGlobalLoading: true }));
      }
      globalLoadingCount += 1;
    },
    hideGlobalLoading: () => {
      if (globalLoadingCount > 0) globalLoadingCount -= 1;
      if (globalLoadingCount > 0) return;
      const elapsed = Date.now() - globalLoadingStartedAt;
      const remaining = Math.max(0, MIN_GLOBAL_LOADING_MS - elapsed);
      if (globalLoadingTimer) clearTimeout(globalLoadingTimer);
      globalLoadingTimer = setTimeout(() => {
        set(() => ({ isGlobalLoading: false }));
        globalLoadingTimer = null;
      }, remaining);
    },
    t: (key) => {
      const keys = key.split(".");
      const { messages } = get();

      let result = messages;
      for (const k of keys) {
        if (typeof result === "object" && k in result) {
          result = result[k] as AbstractIntlMessages;
        }
      }
      return typeof result === "string" ? result : "";
    },
    updateCurrentProject: async (currentProject) => {
      await setCookies({ projectId: currentProject?.id ?? "" });
      set(() => ({ currentProject }));
    },
    updateCurrentMember: (currentMember) => {
      set(() => ({ currentMember }));
    },
    updateCurrentOrg: (currentOrg) => {
      set(() => ({ currentOrg }));
    },
    updateFavoriteServices: (favoriteServices) => {
      set((state) => ({ ...state, favoriteServices }));
    },
    openDialog: (
      dialogProps,
      { buttonProps, callbackAPI = () => SUCCESS_200 },
    ) => {
      set((state) => ({
        ...state,
        dialogProps: {
          onOpen: state.closeDialog,
          onCancel: state.closeDialog,
          ...dialogProps,
          isOpen: true,
        },
        dialogButtonState: {
          ...state.dialogButtonState,
          buttonProps,
          callbackAPI,
        },
      }));
    },
    closeDialog: () => {
      set((state) => ({
        ...state,
        dialogProps: { ...state.dialogProps, isOpen: false },
        dialogButtonState: {
          ...state.dialogButtonState,
          isValid: true,
          isLoading: false,
        },
        formTrigger: null,
      }));
    },
    setFormData: (data) => {
      set(() => ({
        formData: data,
      }));
    },
    setDialogContentData: (key: string, data: unknown) => {
      set(() => ({
        dialogContentData: {
          key,
          data,
        },
      }));
    },
    setFormTrigger: (formTrigger) => {
      set(() => ({
        formTrigger: formTrigger as UseFormTrigger<FieldValues>,
      }));
    },
    setIsLoading: (isLoading) => {
      set((state) => ({
        dialogButtonState: { ...state.dialogButtonState, isLoading },
      }));
    },
    setIsDisabled: (isDisabled) => {
      set((state) => ({
        dialogButtonState: {
          ...state.dialogButtonState,
          buttonProps: {
            ...state.dialogButtonState.buttonProps,
            disabled: isDisabled,
          },
        },
      }));
    },
    setIsValid: (isValid) => {
      set((state) => ({
        dialogButtonState: { ...state.dialogButtonState, isValid },
      }));
    },
    updateLayoutDialogState: (data) => {
      set((state) => ({
        layoutDialogStates: updateDialogStates(state.layoutDialogStates, data),
      }));
    },
    updateKey: <K extends keyof Omit<LayoutState, "updateKey">>(
      key: K,
      value: LayoutState[K],
    ) => {
      set(() => ({
        [key]: value,
      }));
    },
  }));

export const {
  StoreProvider: LayoutStoreProvider,
  useStoreContext: useLayoutStore,
} = createStoreContext<LayoutStore>(createLayoutStore);

type GlobalDialogState = {
  dialogProps: InfoDialogProps & { dialogContent: ReactNode };
  dialogContentData: {
    key: string;
    data: unknown;
  };
  dialogButtonState: {
    buttonProps: ButtonProps;
    isValid: boolean;
    isLoading: boolean;
    callbackAPI: (
      data: Record<string, unknown>,
    ) => Promise<FetchResult<unknown>>;
  };
  formData: Record<string, unknown>;
  formTrigger: UseFormTrigger<FieldValues> | null;
};

type GlobalDialogActions = {
  openDialog: (
    dialogProps: GlobalDialogState["dialogProps"],
    buttonConfig: {
      buttonProps: ButtonProps;
      callbackAPI?: (
        data: Record<string, unknown>,
      ) => Promise<FetchResult<unknown>>;
    },
  ) => void;
  closeDialog: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsDisabled: (isDisabled: boolean) => void;
  setIsValid: (isValid: boolean) => void;
  setFormData: (data: Record<string, unknown>) => void;
  setDialogContentData: (id: string, data: unknown) => void;
  setFormTrigger: <T extends FieldValues>(trigger: UseFormTrigger<T>) => void;
};

function updateDialogStates(
  currentStates: LayoutDialogStateMap,
  data: Partial<{
    [K in LayoutDialogType]: Partial<LayoutDialogStateMap[K]>;
  }>,
): LayoutDialogStateMap {
  return Object.keys(currentStates).reduce((acc, key) => {
    const dialogKey = key as LayoutDialogType;
    acc[dialogKey] = getUpdatedDialogState(data[dialogKey]);
    return acc;
  }, {} as LayoutDialogStateMap);
}

function getUpdatedDialogState(
  newData?: Partial<LayoutDialogStateMap[LayoutDialogType]>,
): LayoutDialogStateMap[LayoutDialogType] {
  if (newData) {
    return { isOpen: newData.isOpen ?? false, ...newData };
  }
  return { isOpen: false };
}
