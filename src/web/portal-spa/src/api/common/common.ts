import {
  type Organization,
  PROJECTS_TAG,
  type Project,
  type User,
} from "@/api/common/types";
import { type GETResponse } from "@/api/types";
import { apiInstance } from "@/api/instance";

export function getCurrentUserInfo() {
  return apiInstance.get<User>("tenant/users/current-user");
}

export const getProjectInfo = (id: string) => {
  return apiInstance.get<Project>(`tenant/projects/${id}`, {
    next: {
      tags: [PROJECTS_TAG],
    },
  });
};

export function getOrganizationList() {
  return apiInstance.get<GETResponse<Organization>>(`tenant/organization/`);
}
