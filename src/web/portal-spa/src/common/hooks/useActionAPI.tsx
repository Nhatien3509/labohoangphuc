import toast from "@common/components/ui/toast";

import { useCallback, useState } from "react";
import type { FetchResult } from "@/api/types";
import { useAppRouter } from "@common/hooks/useAppRouter";

type useActionAPIResult<K extends string> = {
  isLoading: boolean;
  loadingStates: Record<K, boolean>;
  executeAction: <T, A extends unknown[]>(
    func: (...args: A) => Promise<FetchResult<T>>,
    ...args: A
  ) => Promise<FetchResult<T> | undefined>;
  executeActionWithKey: <T, A extends unknown[]>(
    func: (...args: A) => Promise<FetchResult<T>>,
    actionKey: K,
    ...args: A
  ) => Promise<FetchResult<T> | undefined>;
};

export const useActionAPI = <K extends string>(
  initialLoadingStates?: Record<K, boolean>,
): useActionAPIResult<K> => {
  const router = useAppRouter();

  const [loadingStates, setLoadingStates] = useState<
    Record<K | "default", boolean>
  >(() =>
    initialLoadingStates
      ? (initialLoadingStates as Record<K | "default", boolean>)
      : ({ default: false } as Record<K | "default", boolean>),
  );

  const executeActionWithKey = useCallback(
    async <T, A extends unknown[]>(
      func: (...args: A) => Promise<FetchResult<T>>,
      actionKey: K | "default",
      ...args: A
    ) => {
      if (loadingStates[actionKey]) return;
      setLoadingStates((prev) => ({ ...prev, [actionKey]: true }));
      const res = await func(...args);
      setLoadingStates((prev) => ({ ...prev, [actionKey]: false }));
      if (!res.success) {
        toast.customError(res.error, res.status, res.statusText);
      }

      if (res.success && res.shouldRefresh) {
        router.refresh();
      }

      return res;
    },
    [loadingStates, router],
  );

  const executeAction = useCallback(
    <T, A extends unknown[]>(
      func: (...args: A) => Promise<FetchResult<T>>,
      ...args: A
    ) => executeActionWithKey(func, "default", ...args),
    [executeActionWithKey],
  );

  return {
    isLoading: loadingStates.default,
    loadingStates,
    executeAction,
    executeActionWithKey,
  };
};
