// Client-side bản sao của apiInstance.ts — gọi BE qua proxy route handler
// (/api/proxy/[...path]) thay vì fetch trực tiếp. Mục đích: request hiện trong
// browser DevTools Network tab để debug. Auth/cookie/project-id vẫn được
// route handler tự ghép phía server.
//
// Shape FetchResult<T> giữ giống apiInstance để các action có thể swap
// import mà không đổi callsite.

import type {
  ApiError,
  FetchResult,
  GetReqInit,
  PatchReqInit,
  ReqInit,
} from "@/api/types";
import {
  buildQueryString,
  pascalifyObject,
  snakifyObject,
} from "@common/lib/helpers/obj";
import { type FlattenError } from "@common/components/containers/ErrorToast";
import camelize from "camelize-ts";

const PROXY_PREFIX = "/api/proxy/";

function parseError(responseData: unknown): ApiError | FlattenError[] {
  try {
    const camelized = camelize(responseData);
    if (Array.isArray(camelized)) return camelized as FlattenError[];
    if (Array.isArray((camelized as { errors?: FlattenError[] }).errors))
      return (camelized as { errors: FlattenError[] }).errors;
    return camelized;
  } catch {
    return [{ message: "Unknown error", code: "unknown_error", location: "" }];
  }
}

// btoa chỉ nhận chuỗi binary; build qua String.fromCharCode theo chunk để
// tránh tràn stack khi spread mảng lớn vào fromCharCode.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function getReqBody(
  payload?: Record<string, unknown> | Record<string, unknown>[] | FormData,
  isKeyTransformEnabled = true,
  isPascalCasePayload = false,
): BodyInit | undefined {
  if (!payload || payload instanceof FormData) return payload;
  if (isPascalCasePayload) {
    return JSON.stringify(pascalifyObject(payload));
  }
  return JSON.stringify(
    isKeyTransformEnabled ? snakifyObject(payload) : payload,
  );
}

async function clientFetch<T>(
  endpoint: string,
  init: ReqInit & { method: string },
): Promise<FetchResult<T>> {
  const isFormData = init.payload instanceof FormData;
  const body = getReqBody(
    init.payload,
    init.isKeyTransformEnabled,
    init.isPascalCasePayload,
  );

  const headers: Record<string, string> = {
    accept: "application/json",
    "error-format": init.errorFormat ?? "flatten",
  };
  if (!isFormData && body) headers["content-type"] = "application/json";

  try {
    const response = await fetch(PROXY_PREFIX + endpoint, {
      method: init.method,
      headers,
      body,
    });

    // BE xuất file (xlsx/csv) trả về binary với content-type chuẩn, KHÔNG phải
    // JSON base64. Đọc bằng response.text() sẽ làm hỏng bytes → consumer atob()
    // ném lỗi dù HTTP 200. Phát hiện content-type binary và chuyển blob → base64
    // (giống parseResponse ở instance.ts) để giữ nguyên callsite.
    const contentType = response.headers.get("content-type") ?? "";
    const isBinaryFile =
      contentType.includes("text/csv") ||
      contentType.includes("application/xlsx") ||
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

    let parsed: unknown = null;
    if (response.ok && isBinaryFile) {
      const buffer = await response.arrayBuffer();
      parsed = arrayBufferToBase64(buffer);
    } else {
      const text = await response.text();
      if (text) {
        try {
          const json = JSON.parse(text) as { data?: unknown };
          const raw = json.data ?? json;
          parsed = init.isKeyTransformEnabled === false ? raw : camelize(raw);
        } catch {
          parsed = text;
        }
      }
    }

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: parsed as T,
      };
    }

    return {
      success: false,
      status: response.status,
      statusText: response.statusText,
      error: parseError(parsed),
    };
  } catch (error) {
    console.error("[clientApi] fetch error", error);
    return {
      success: false,
      status: -1,
      statusText: "Data fetching error",
      error: { detail: "Data fetching error" },
    };
  }
}

export const clientApi = {
  get: <T>(
    endpoint: string,
    init: GetReqInit = {},
  ): Promise<FetchResult<T>> => {
    const { query, ...rest } = init;
    const qs = query ? buildQueryString(query, true) : "";
    return clientFetch<T>(endpoint + qs, { ...rest, method: "GET" });
  },
  post: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    clientFetch<T>(endpoint, { ...init, method: "POST" }),
  put: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    clientFetch<T>(endpoint, { ...init, method: "PUT" }),
  delete: <T>(endpoint: string, init: ReqInit = {}): Promise<FetchResult<T>> =>
    clientFetch<T>(endpoint, { ...init, method: "DELETE" }),
  patch: <T>(
    endpoint: string,
    init: PatchReqInit = {},
  ): Promise<FetchResult<T>> =>
    clientFetch<T>(endpoint, { ...init, method: "PATCH" }),
};
