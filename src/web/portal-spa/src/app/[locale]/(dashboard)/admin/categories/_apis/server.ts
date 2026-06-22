import "server-only";

import type {
  CategoryListParams,
  CategoryListResult,
  CategoryRow,
} from "./types";
import { type RawConnectedSystem, normalizeConnectedSystem } from "./normalize";
import { format, isValid, parseISO } from "date-fns";
import { apiInstance } from "@/api/instance";

const GET_ALL_ENDPOINT = "api/v1/connected-systems/get-all";

function mapItem(raw: RawConnectedSystem): CategoryRow {
  const cs = normalizeConnectedSystem(raw);
  if (!cs.id) {
    console.warn(
      "[categories] connected-system item missing id:",
      JSON.stringify(raw),
    );
  }
  return {
    id: cs.id,
    name: cs.name,
    softwareCode: cs.softwareCode,
    softwareType: cs.softwareType,
    addresses: (cs.endpoints ?? []).map((e) => ({
      type: e.type === "ip" ? "IP" : "Domain",
      value:
        e.type === "domain" && e.protocol
          ? `${e.protocol}://${e.baseUrl}`
          : e.baseUrl,
    })),
    status: cs.status === "ACTIVE" ? "active" : "inactive",
    createdAt: cs.createdAt
      ? (() => {
          const d = parseISO(cs.createdAt);
          return isValid(d) ? format(d, "dd/MM/yyyy") : "";
        })()
      : "",
  };
}

function matchesSearch(row: CategoryRow, search: string): boolean {
  if (!search) return true;
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    row.name.toLowerCase().includes(q) ||
    row.softwareCode.toLowerCase().includes(q)
  );
}

function matchesStatus(row: CategoryRow, status: string): boolean {
  if (!status) return true;
  return row.status === status;
}

function matchesSoftwareType(row: CategoryRow, softwareType: string): boolean {
  if (!softwareType) return true;
  return (row.softwareType ?? "") === softwareType;
}

function matchesDateRange(
  row: CategoryRow,
  fromDate: string,
  toDate: string,
): boolean {
  if (!fromDate && !toDate) return true;
  if (!row.createdAt) return false;
  const [d, m, y] = row.createdAt.split("/");
  if (!d || !m || !y) return false;
  const rowIso = `${y}-${m}-${d}`;
  if (fromDate && rowIso < fromDate.slice(0, 10)) return false;
  if (toDate && rowIso > toDate.slice(0, 10)) return false;
  return true;
}

export async function getCategoryList({
  page,
  pageSize,
  search,
  status,
  softwareType,
  fromDate,
  toDate,
}: CategoryListParams): Promise<CategoryListResult> {
  const res = await apiInstance.get<
    RawConnectedSystem[] | { items?: RawConnectedSystem[] }
  >(GET_ALL_ENDPOINT);

  if (!res.success || !res.data) {
    return { items: [], total: 0 };
  }

  const raw = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
  const all = raw.map(mapItem);

  const filtered = all
    .filter((r) => matchesSearch(r, search))
    .filter((r) => matchesStatus(r, status))
    .filter((r) => matchesSoftwareType(r, softwareType))
    .filter((r) => matchesDateRange(r, fromDate, toDate));

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total: filtered.length };
}
