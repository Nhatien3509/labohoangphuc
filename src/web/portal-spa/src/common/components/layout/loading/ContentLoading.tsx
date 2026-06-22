import { Skeleton } from "@common/components/ui/skeleton";

import React from "react";
import { cn } from "@common/lib/core/utils";

const ContentLoading = (props: React.HTMLProps<HTMLDivElement>) => (
  <Skeleton
    {...props}
    className={cn("h-[41.5rem] !rounded-lg", props.className)}
  />
);

export default ContentLoading;
