import { cn } from "@common/lib/core/utils";

function Skeleton({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "relative animate-shimmer overflow-hidden rounded-md bg-shimmer-gradient bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
