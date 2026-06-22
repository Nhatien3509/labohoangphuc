"use client";

import ContentLoading from "@common/components/layout/loading/ContentLoading";
import HydrationLoading from "@common/components/layout/loading/HydrationLoading";

import React, { type ReactNode, Suspense } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

interface LayoutWithSidebarProps {
  SidebarComponent?: ReactNode;
  BreadcrumbComponent?: ReactNode;
  children: ReactNode;
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  SidebarComponent,
  BreadcrumbComponent,
  children,
}) => {
  const { isNotFound } = useLayoutStore((state) => state);

  const classNameLayoutByNotFound = isNotFound
    ? ""
    : "flex w-full flex-row space-x-6 p-6 max-lg:flex-col max-lg:space-x-0 max-lg:p-0 max-lg:pt-3";
  const classNameLayout =
    typeof isNotFound === "undefined"
      ? "flex w-full flex-col"
      : classNameLayoutByNotFound;
  const classNameContentWrapperByNotFound = isNotFound
    ? ""
    : "flex-1 min-w-0 min-h-0 max-lg:p-3";
  const classNameContentWrapper =
    typeof isNotFound === "undefined"
      ? "hidden"
      : classNameContentWrapperByNotFound;

  return (
    <div className={classNameLayout}>
      {typeof isNotFound === "undefined" && <HydrationLoading />}
      {isNotFound === false && (
        <div className="shrink-0">{SidebarComponent}</div>
      )}
      <div className={classNameContentWrapper}>
        {isNotFound === false && BreadcrumbComponent}
        <div className="mt-3 min-h-0 w-full">
          <Suspense fallback={<ContentLoading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
