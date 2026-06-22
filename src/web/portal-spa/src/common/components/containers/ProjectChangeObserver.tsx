"use client";

import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@common/lib/core/routes";
import { UUID_REGEX } from "@common/lib/core/const";
import { findLastMatchedIndex } from "@common/lib/helpers/str";
import { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

const getNewPathWithoutItemId = (
  pathname: string,
  prevProjectId: string,
  currentProjectId: string,
) => {
  let newPath = pathname;

  const segments = pathname.split("/");
  const uuidLastIndex = findLastMatchedIndex(segments, (part) =>
    UUID_REGEX.test(part),
  );
  const lastUuid = segments[uuidLastIndex];

  if (lastUuid && lastUuid !== prevProjectId) {
    newPath = segments.slice(0, uuidLastIndex).join("/") || "/";
  }
  newPath = newPath.replace(prevProjectId, currentProjectId);

  return newPath;
};

const ProjectChangeObserver = ({
  prevProjectId,
}: Readonly<{ prevProjectId?: string }>) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentProject } = useLayoutStore((state) => state);
  const currentProjectId = currentProject?.id ?? "";

  useEffect(() => {
    const handleCurrentProjectChange = () => {
      if (!prevProjectId) return;
      if (currentProjectId === prevProjectId) return;
      if (!currentProjectId) {
        router.push(ROUTES.dashboard.home);
        return;
      }

      const segments = pathname.split("/");
      if (segments.includes("marketplace")) return;
      const isInvitationProjectUser = segments.includes("invitation");

      if (isInvitationProjectUser) {
        router.push(ROUTES.dashboard.home);
        return;
      }

      const newPath = getNewPathWithoutItemId(
        pathname,
        prevProjectId,
        currentProjectId,
      );

      router.replace(newPath);

      router.refresh();
    };

    handleCurrentProjectChange();
  }, [currentProjectId]);

  return null;
};

export default ProjectChangeObserver;
