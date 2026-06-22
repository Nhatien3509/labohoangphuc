"use server";

import {
  PROJECTS_TAG,
  PROJECT_REGIONS_TAG,
  type Project,
  type ProjectService,
  type QuestionBody,
  type QuestionResponse,
  type Region,
  type ServiceRegion,
  type Zone,
} from "@/api/common/types";
import type { DefaultParams } from "@common/lib/helpers/params";
import type { GETResponse } from "@/api/types";
import type { ServiceName } from "@common/lib/core/types";
import { apiInstance } from "@/api/instance";
import { getCookies } from "@common/lib/core/server-side";

export async function askQuestions(payload: QuestionBody) {
  return apiInstance.post<QuestionResponse>("support/questions/", {
    payload,
  });
}

export async function getProjectInfo(id: string) {
  return apiInstance.get<Project>(`tenant/projects/${id}`, {
    next: {
      tags: [PROJECTS_TAG],
    },
  });
}

export const getProjectRegionsByService = (id: string) => {
  const { projectId } = getCookies(["projectId"]);

  return apiInstance.get<GETResponse<ServiceRegion>>(
    `v2/projects/${projectId}/services/${id}/regions/`,
  );
};

export const getRegionsByServiceName = async (serviceName: ServiceName) => {
  const projectServices = await getProjectServices();
  const serviceId =
    projectServices.data?.results.find(
      ({ service }) => service.name === serviceName,
    )?.service.id ?? "";

  return getProjectRegionsByService(serviceId);
};

export const getProjectServices = () => {
  const { projectId } = getCookies(["projectId"]);
  return apiInstance.get<GETResponse<ProjectService>>(
    `v2/projects/${projectId}/services`,
  );
};

export async function getZoneList(query?: DefaultParams) {
  return apiInstance.get<GETResponse<Zone>>("organization/zones", {
    query,
  });
}

export async function activateRegionServices(
  payload: {
    serviceIds: string[];
    regionId: string;
  },
  revalidate = true,
  projectIdOverride?: string,
) {
  const { projectId: cookieProjectId } = getCookies(["projectId"]);
  const projectId = projectIdOverride ?? cookieProjectId;

  return apiInstance.post(
    `v2/projects/${projectId}/services/activate/`,
    { payload },
    revalidate ? [PROJECT_REGIONS_TAG] : undefined,
  );
}

export const checkBillingPlan = async () => {
  const { projectId } = getCookies(["projectId"]);
  const res = await getProjectInfo(projectId);

  return !!res.data?.hasBillingPlan;
};

export async function getRegionList(query?: DefaultParams) {
  return apiInstance.get<GETResponse<Region>>("organization/regions", {
    query,
  });
}
