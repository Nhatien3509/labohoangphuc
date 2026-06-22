import ProjectChangeObserver from "@common/components/containers/ProjectChangeObserver";
import { Toaster } from "@common/components/ui/sonner";

import AddServiceToLocalStorage from "@common/components/layout/AddServiceToLocalStorage";
import AuthListener from "@common/components/layout/AuthListener";
import ComingSoonDialog from "@common/components/layout/dialogs/ComingSoonDialog";
import CookiesInitializer from "@common/components/layout/CookiesInitializer";
import CreateProjectDialog from "@common/components/dialogs/CreateProjectDialog";
import { FeatureFlagStoreProvider } from "@common/stores/FeatureFlagStoreProvider";
import Footer from "@common/components/layout/Footer";
import Header from "@common/components/layout/Header";
import { LayoutStoreProvider } from "@common/components/layout/providers/LayoutStoreProvider";
import NavigationStateSync from "@common/components/layout/loading/NavigationStateSync";
import NotFoundCleanup from "@common/components/layout/NotFoundCleanup";
import ProjectRequiredDialog from "@common/components/layout/dialogs/ProjectRequiredDialog";
import SubscriptionDialog from "@common/components/layout/dialogs/subcription-dialog/SubscriptionDialog";

import { type SessionData, getSession } from "@common/lib/core/auth";
import {
  getCurrentUserInfo,
  getOrganizationList,
  getProjectInfo,
} from "@/api/common/common";
import { getRegionList, getZoneList } from "@/api/common/common.actions";
import type { ReactNode } from "react";
import { defaultOrg } from "@/api/common/types";
import { env } from "@/env";
import { getCookies } from "@common/lib/core/server-side";
import { getInitialFeatureFlags } from "@common/lib/feature-flags/server";
import { loadMessages } from "@/common/lib/i18n/request";

export default async function LayoutProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [{ isLoggedIn }, messages] = await Promise.all([
    getSession<SessionData>("session"),
    loadMessages("common"),
  ]);
  const flags = getInitialFeatureFlags();
  const publicLayoutStore = {
    messages,
    isLoggedIn: false,
    url: {
      DOCS_URL: env.DOCS_URL,
      CONSOLE_URL: env.CONSOLE_URL,
      CONTAINER_REGISTRY_URL: env.CONTAINER_REGISTRY_URL,
    },
    launchingServices: [],
    services: [],
  };

  if (!isLoggedIn)
    return (
      <LayoutStoreProvider {...publicLayoutStore}>
        {children}
      </LayoutStoreProvider>
    );

  const { projectId } = getCookies(["projectId"]);
  const [
    { data: currentUser },
    { data: orgList },
    regionsResponse,
    zonesResponse,
  ] = await Promise.all([
    getCurrentUserInfo(),
    getOrganizationList(),
    getRegionList({ pageSize: 100 }),
    getZoneList({ pageSize: 100 }),
  ]);

  const billingAccount = null;
  const currentProjectBillingAccount = null;

  const [firstOrganization] = orgList?.results ?? [];
  const organizationId = firstOrganization?.id ?? "";
  const rootDirId = firstOrganization?.root ?? "";

  const cookiesData: Record<string, string> = {
    organizationId,
    rootDirId,
    ...(currentUser?.id && { currentUserId: currentUser.id }),
    ...(projectId && { projectId }),
  };

  const baseProvider = {
    isLoggedIn,
    currentUser,
    currentProject: undefined,
    currentOrg: firstOrganization ?? defaultOrg,
    allowedActions: undefined,
    services: [],
    categories: [],
    favoriteServices: [],
    messages,
    url: {
      DOCS_URL: env.DOCS_URL,
      CONSOLE_URL: env.CONSOLE_URL,
      CONTAINER_REGISTRY_URL: env.CONTAINER_REGISTRY_URL,
    },
    launchingServices: [],
    layoutDialogStates: {
      coming_soon: { isOpen: false },
      subscription: { isOpen: false },
      create_project: { isOpen: false },
      project_required: { isOpen: false },
    },
    billingAccount,
    currentProjectBillingAccount,
    projects: [],
    regions: regionsResponse.data?.results ?? [],
    vpcs: [],
    zones: zonesResponse.data?.results ?? [],
  };

  let enriched = {};

  if (projectId) {
    const projectRes = await getProjectInfo(projectId);
    const project = projectRes.data;

    enriched = {
      currentProject: project,
      allowedActions: new Set<string>(),
    };
  }

  const dataProvider = {
    ...baseProvider,
    ...enriched,
  };

  return (
    <LayoutStoreProvider {...dataProvider}>
      <NavigationStateSync />
      <NotFoundCleanup />
      <FeatureFlagStoreProvider flags={flags}>
        <CookiesInitializer cookiesData={cookiesData} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1 bg-neutral-bg dark:bg-neutral-dark-bg">
            {children}
          </div>
          <Footer />
        </div>
        <Toaster />
        <CreateProjectDialog />
        <SubscriptionDialog />
        <ComingSoonDialog />
        <ProjectRequiredDialog />
        <ProjectChangeObserver prevProjectId={projectId} />
        <AddServiceToLocalStorage />
        <AuthListener />
      </FeatureFlagStoreProvider>
    </LayoutStoreProvider>
  );
}
