import "server-only";

import type {
  ApiEnvelope,
  FetchResult,
  GetReqInit,
  ReqInit,
} from "@/api/types";
import { env } from "@/env";
import { getAccessToken } from "@/api/session";

/**
 * HTTP client tối giản cho backend Go (labo-warranty).
 *
 * Phiên bản gọn của `src/api/instance.ts` trong portal-spa: bỏ phần auth/SSO,
 * feature-flags, key-transform camel↔snake. Giữ lại đúng phần lõi: ghép URL,
 * unwrap bao envelope `{ success, data, error }`, và trả `FetchResult<T>`.
 *
 * Chỉ chạy ở server (Server Components / Server Actions) — xem `import "server-only"`.
 */

const BASE_URL = `${env.BACKEND_URL.replace(/\/+$/, "")}/api/v1`;

function buildQueryString(query?: GetReqInit["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function joinUrl(endpoint: string): string {
  return `${BASE_URL}/${endpoint.replace(/^\/+/, "")}`;
}

async function request<T>(
  endpoint: string,
  init: ReqInit & { method: string },
): Promise<FetchResult<T>> {
  const { payload, headers, auth, ...rest } = init;
  const authHeader: Record<string, string> = {};
  if (auth) {
    const token = getAccessToken();
    if (token) authHeader.authorization = `Bearer ${token}`;
  }
  try {
    const response = await fetch(endpoint, {
      ...rest,
      headers: {
        accept: "application/json",
        ...(payload ? { "content-type": "application/json" } : {}),
        ...authHeader,
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    let envelope: ApiEnvelope<T> | null = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
      envelope = (await response.json()) as ApiEnvelope<T>;
    }

    if (response.ok && envelope?.success) {
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: envelope.data ?? undefined,
      };
    }

    return {
      success: false,
      status: response.status,
      statusText: response.statusText,
      error:
        typeof envelope?.error === "string"
          ? envelope.error
          : response.status === 401
            ? "UNAUTHORIZED"
            : "INTERNAL_SERVER_ERROR",
    };
  } catch (error) {
    console.error("[api] fetch error:", error);
    return {
      success: false,
      status: -1,
      statusText: "Network error",
      error: "NETWORK_ERROR",
    };
  }
}

export const apiInstance = {
  get: <T>(endpoint: string, init: GetReqInit = {}): Promise<FetchResult<T>> => {
    const { query, ...rest } = init;
    return request<T>(joinUrl(endpoint) + buildQueryString(query), {
      ...rest,
      method: "GET",
    });
  },

  post: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    request<T>(joinUrl(endpoint), { ...init, method: "POST" }),

  put: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    request<T>(joinUrl(endpoint), { ...init, method: "PUT" }),

  patch: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    request<T>(joinUrl(endpoint), { ...init, method: "PATCH" }),

  delete: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    request<T>(joinUrl(endpoint), { ...init, method: "DELETE" }),
};
