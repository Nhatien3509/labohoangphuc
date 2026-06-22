"use client";

import { useEffect, useTransition } from "react";
import { isSamePathAndSearch } from "@common/components/containers/AppLink";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useRouter } from "next/navigation";

export function useAppRouter() {
  const router = useRouter();
  const [isRefreshPending, startRefreshTransition] = useTransition();

  const { setIsNavigating, setIsRefreshing } = useLayoutStore((state) => ({
    setIsNavigating: state.setIsNavigating,
    setIsRefreshing: state.setIsRefreshing,
  }));

  const push = (href: string) => {
    if (isSamePathAndSearch(href)) return;
    setIsNavigating(true);
    router.push(href);
  };

  const replace = (href: string) => {
    setIsNavigating(true);
    router.replace(href);
  };

  const back = () => {
    setIsNavigating(true);
    router.back();
  };

  const forward = () => {
    setIsNavigating(true);
    router.forward();
  };

  const refresh = () => {
    setIsRefreshing(true);
    startRefreshTransition(() => {
      router.refresh();
    });
  };

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  useEffect(() => {
    if (isRefreshPending) return;

    setIsRefreshing(false);
  }, [isRefreshPending, setIsRefreshing]);

  return { push, replace, back, forward, refresh, prefetch };
}
