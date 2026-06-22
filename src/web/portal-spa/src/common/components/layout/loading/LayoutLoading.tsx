import { Skeleton } from "@common/components/ui/skeleton";

import ContentLoading from "@common/components/layout/loading/ContentLoading";

import { cn } from "@common/lib/core/utils";

const LayoutLoading = ({ hasSidebar = true }: { hasSidebar?: boolean }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-row space-x-6 p-6 max-lg:flex-col max-lg:space-x-0 max-lg:p-0 max-lg:pt-3",
      )}
    >
      {hasSidebar && (
        <div className="shrink-0">
          <aside className="flex h-full min-w-[16.5rem] flex-col gap-2">
            <Skeleton className="h-[3.75rem]" />
            <Skeleton className="flex-1" />
          </aside>
        </div>
      )}
      <div className="flex grow flex-col gap-3 max-lg:p-3">
        {hasSidebar && (
          <div className="h-[3.75rem] w-[30rem] py-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="mt-1 h-6 w-[10rem]" />
          </div>
        )}
        <div className="h-full w-full">
          <ContentLoading className={cn(!hasSidebar && "h-full flex-1")} />
        </div>
      </div>
    </div>
  );
};

export default LayoutLoading;
