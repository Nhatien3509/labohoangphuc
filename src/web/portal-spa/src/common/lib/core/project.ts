import { type Project } from "@/api/common/types";

export const findProjectById = (
  projectList: Project[],
  id: string | undefined,
): Project | null => {
  return (
    projectList.find((project) => project.id === id) ?? projectList[0] ?? null
  );
};
