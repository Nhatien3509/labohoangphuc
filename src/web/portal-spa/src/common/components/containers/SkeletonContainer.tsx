import { Skeleton } from "@common/components/ui/skeleton";

import { cn } from "@common/lib/core/utils";

type SkeletonTag = "default" | "input";

type SkeletonContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  containerClassName?: string;
  skeletonCount: number;
  tag?: SkeletonTag;
};

const skeletonRenderers: Record<
  SkeletonTag,
  (className?: string, key?: number) => React.JSX.Element
> = {
  default: (className, key) => (
    <Skeleton key={key} className={cn("h-10 w-full", className)} />
  ),
  input: (className, key) => (
    <div key={key} className="flex h-[3.75rem] flex-col gap-1">
      <Skeleton className="h-5 w-24 text-base" />
      <Skeleton className={cn("h-9 w-full", className)} />
    </div>
  ),
};

const SkeletonContainer = ({
  className: skeletonClassName,
  containerClassName,
  skeletonCount,
  tag = "default",
  ...props
}: SkeletonContainerProps) => (
  <div className={cn("space-y-2 text-center", containerClassName)} {...props}>
    {Array.from({ length: skeletonCount }, (_, i) =>
      skeletonRenderers[tag](skeletonClassName, i),
    )}
  </div>
);

export default SkeletonContainer;
