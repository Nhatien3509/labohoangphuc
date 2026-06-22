"use client";

import type { ServiceName } from "@common/lib/core/types";
import { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { usePathname } from "next/navigation";
import { useRecentlyVisitedService } from "@common/components/layout/providers/RecentlyVisitedServiceStore";

const AddServiceToLocalStorage = () => {
  const add = useRecentlyVisitedService((s) => s.add);
  const launchingServices = useLayoutStore((state) => state.launchingServices);
  const pathName = usePathname();

  useEffect(() => {
    const segment = pathName.split("/")[2];
    if (!segment) return;

    const service = launchingServices.find((s) => {
      const serviceSegment = s.homeHref?.split("/").find(Boolean);
      return serviceSegment === segment;
    });
    if (!service) return;

    add(service.name as ServiceName);
  }, [pathName, add, launchingServices]);

  return null;
};

export default AddServiceToLocalStorage;
