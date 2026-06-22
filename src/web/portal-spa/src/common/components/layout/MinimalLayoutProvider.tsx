import { type ReactNode, Suspense } from "react";
import AntdConfigProvider from "@common/components/providers/AntdConfigProvider";
import { FeatureFlagStoreProvider } from "@common/stores/FeatureFlagStoreProvider";
import FullScreenLoading from "@common/components/layout/loading/FullScreenLoading";
import { LayoutStoreProvider } from "@common/components/layout/providers/LayoutStoreProvider";
import NavigationStateSync from "@common/components/layout/loading/NavigationStateSync";
import { Toaster } from "@common/components/ui/sonner";
import { env } from "@/env";
import { getInitialFeatureFlags } from "@common/lib/feature-flags/server";
import { loadMessages } from "@/common/lib/i18n/request";

export default async function MinimalLayoutProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const messages = await loadMessages("common");
  const flags = getInitialFeatureFlags();

  return (
    <LayoutStoreProvider
      messages={messages}
      isLoggedIn={false}
      url={{
        DOCS_URL: env.DOCS_URL,
        CONSOLE_URL: env.CONSOLE_URL,
        CONTAINER_REGISTRY_URL: env.CONTAINER_REGISTRY_URL,
      }}
      launchingServices={[]}
      services={[]}
    >
      <FeatureFlagStoreProvider flags={flags}>
        <Suspense fallback={null}>
          <NavigationStateSync />
        </Suspense>
        <FullScreenLoading />
        <AntdConfigProvider>{children}</AntdConfigProvider>
        <Toaster />
      </FeatureFlagStoreProvider>
    </LayoutStoreProvider>
  );
}
