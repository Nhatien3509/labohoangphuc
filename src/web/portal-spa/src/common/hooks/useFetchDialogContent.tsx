"use client";

import type { FetchResult } from "@/api/types";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

interface UseFetchDialogContentProps<T> {
  cacheKey: string;
  getApi: () => Promise<FetchResult<T>>;
}

const useFetchDialogContent = <T,>({
  cacheKey,
  getApi,
}: UseFetchDialogContentProps<T>) => {
  const { dialogContentData, setDialogContentData } = useLayoutStore(
    (state) => state,
  );
  const { isLoading, executeAction } = useActionAPI();

  const fetchApi = async () => {
    const res = await executeAction(getApi);
    if (!res?.success) return;
    setDialogContentData(cacheKey, res.data);
  };

  useEffect(() => {
    if (!cacheKey || dialogContentData.key === cacheKey) return;
    void fetchApi();
  }, [cacheKey]);

  return {
    data: dialogContentData.data as T | null,
    isLoading,
  };
};

export default useFetchDialogContent;
