"use server";

import type {
  CheckCodeDuplicateResponse,
  ConnectedSystem,
  CreateConnectedSystemPayload,
  UpdateConnectedSystemPayload,
} from "./types";
import { type RawConnectedSystem, normalizeConnectedSystem } from "./normalize";
import { apiInstance } from "@/api/instance";
import { pascalifyObject } from "@common/lib/helpers/obj";
import { revalidatePath } from "next/cache";

const CREATE_ENDPOINT = "api/v1/connected-systems";
const DETAIL_ENDPOINT = (id: number) => `api/v1/connected-systems/${id}`;
const BULK_DELETE_ENDPOINT = "api/v1/connected-systems/bulk-delete";
const INACTIVATE_ENDPOINT = (id: number) =>
  `api/v1/connected-systems/${id}/inactivate`;
const CHECK_DUPLICATE_ENDPOINT = "api/v1/connected-systems/check-duplicate";
const LIST_PATH = "/[locale]/admin/categories";

function revalidateList() {
  revalidatePath(LIST_PATH, "page");
}

export async function createConnectedSystem(
  payload: CreateConnectedSystemPayload,
) {
  const res = await apiInstance.post<ConnectedSystem>(CREATE_ENDPOINT, {
    payload: pascalifyObject(payload) as Record<string, unknown>,
    isPascalCasePayload: true,
  });

  if (res.success) {
    revalidateList();
  }

  return res;
}

export async function getConnectedSystemDetail(id: number) {
  const res = await apiInstance.get<RawConnectedSystem>(DETAIL_ENDPOINT(id));
  if (res.success && res.data) {
    return { ...res, data: normalizeConnectedSystem(res.data) };
  }
  return res as typeof res & { data?: ConnectedSystem };
}

export async function updateConnectedSystem(
  id: number,
  payload: UpdateConnectedSystemPayload,
) {
  const res = await apiInstance.patch<ConnectedSystem>(DETAIL_ENDPOINT(id), {
    payload: pascalifyObject(payload) as Record<string, unknown>,
    isPascalCasePayload: true,
  });

  if (res.success) {
    revalidateList();
  }

  return res;
}

export async function inactivateConnectedSystem(id: number) {
  const res = await apiInstance.get(INACTIVATE_ENDPOINT(id));

  if (res.success) {
    revalidateList();
  }

  return res;
}

export async function checkConnectedSystemDuplicate(
  code: string,
  excludeId?: number,
) {
  // BE dùng c.Query("Code") / c.Query("ExcludeID") case-sensitive; apiInstance
  // tự snake_case keys nên append trực tiếp để giữ PascalCase.
  const params = new URLSearchParams({ Code: code });
  if (excludeId) params.append("ExcludeID", String(excludeId));
  const endpoint = `${CHECK_DUPLICATE_ENDPOINT}?${params.toString()}`;
  return apiInstance.get<CheckCodeDuplicateResponse>(endpoint);
}

export async function deleteConnectedSystem(id: number) {
  const res = await apiInstance.delete(DETAIL_ENDPOINT(id));

  if (res.success) {
    revalidateList();
  }

  return res;
}

export async function bulkDeleteConnectedSystems(ids: number[]) {
  const res = await apiInstance.post(BULK_DELETE_ENDPOINT, {
    payload: pascalifyObject({ ids }) as Record<string, unknown>,
    isPascalCasePayload: true,
  });

  if (res.success) {
    revalidateList();
  }

  return res;
}
