import { Skeleton } from "@common/components/ui/skeleton";

import { type ReactNode, useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type FormSkeletonProps = {
  isLoading: boolean;
  children: ReactNode;
  fieldCount?: number;
};

export default function SkeletonForm({
  isLoading,
  children,
  fieldCount = 2,
}: Readonly<FormSkeletonProps>) {
  const setIsDisabled = useLayoutStore((state) => state.setIsDisabled);

  useEffect(() => {
    setIsDisabled(isLoading);
  }, [setIsDisabled, isLoading]);

  if (!isLoading) return children;

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: fieldCount }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
