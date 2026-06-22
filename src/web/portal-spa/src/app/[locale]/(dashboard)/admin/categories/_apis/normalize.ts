import type { ConnectedSystem, ConnectedSystemEndpoint } from "./types";

/**
 * BE trả PascalCase (`ID`, `BaseURL`) — camelize-ts chỉ hạ chữ đầu tiên
 * nên ra `iD`, `baseURL`. Hàm này gộp về `id`, `baseUrl` chuẩn.
 */
type RawConnectedSystemEndpoint = Omit<
  ConnectedSystemEndpoint,
  "id" | "baseUrl"
> & {
  id?: number;
  iD?: number;
  baseUrl?: string;
  baseURL?: string;
};

export type RawConnectedSystem = Omit<ConnectedSystem, "id" | "endpoints"> & {
  id?: number;
  iD?: number;
  endpoints?: RawConnectedSystemEndpoint[];
};

export function normalizeConnectedSystem(
  raw: RawConnectedSystem,
): ConnectedSystem {
  return {
    ...raw,
    id: raw.id ?? raw.iD ?? 0,
    endpoints: (raw.endpoints ?? []).map((e) => ({
      ...e,
      id: e.id ?? e.iD ?? 0,
      baseUrl: e.baseUrl ?? e.baseURL ?? "",
    })),
  };
}
