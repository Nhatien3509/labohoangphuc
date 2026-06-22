"use client";

import { useAppRouter } from "@common/hooks/useAppRouter";
import { useTransition } from "react";

export function useTransitionNav() {
  const router = useAppRouter();
  const [isRedirecting, startTransition] = useTransition();

  const replace = (href: string) => {
    startTransition(() => {
      router.replace(href);
    });
  };

  const push = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return { replace, push, isRedirecting };
}
