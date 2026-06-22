import {
  type AccessTokenData,
  type SessionData,
  getSession,
} from "@common/lib/core/auth";
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
  pickProps,
  sanitizeObject,
  snakifyObject,
} from "@common/lib/helpers/obj";
import { cookies, headers } from "next/headers";
import { type FlattenError } from "@common/components/containers/ErrorToast";
import camelize from "camelize-ts";
import { convertDateNow } from "@common/lib/helpers/datetime";
import { env } from "@/env";
import { getFeatureFlags } from "@common/lib/feature-flags/server";
import { revalidateTag } from "next/cache";

const fetcher = async <T>(
  reqInfo: RequestInfo,
  init: ReqInit,
  retries = 0,
  tags: string[] = [],
): Promise<FetchResult<T>> => {
  const startTime = performance.now();
  const headers = await getReqHeaders(init);
  const body = getReqBody(
    init.payload,
    init.isKeyTransformEnabled,
    init.isPascalCasePayload,
  );

  const reqInit: ReqInit = { ...init, headers, body };
  const response = await fetchWithRetry<T>(reqInfo, reqInit, retries);
  const endTime = performance.now();
  logRequest({
    reqInfo,
    init,
    response,
    responseTime: endTime - startTime,
    headers,
  });

  const shouldRefresh = response.success && tags.length > 0;

  if (shouldRefresh) {
    tags.forEach(revalidateTag);
  }

  return {
    ...response,
    shouldRefresh,
  };
};

function parseError(responseData: unknown): ApiError | FlattenError[] {
  try {
    const camelized = camelize(responseData);
    if (Array.isArray(camelized)) return camelized as FlattenError[];
    if (Array.isArray((camelized as { errors?: FlattenError[] }).errors))
      return (camelized as { errors: FlattenError[] }).errors;
    return camelized;
  } catch (e) {
    console.error("Failed to parse error response", e);
    return [{ message: "Unknown error", code: "unknown_error", location: "" }];
  }
}

async function parseResponse<T>(
  response: Response,
  isKeyTransformEnabled = true,
): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.bodyUsed || response.headers.get("content-length") === "0") {
    console.warn("Empty response body");
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      const jsonResponse = (await response.json()) as { data?: unknown };
      return isKeyTransformEnabled
        ? (camelize(jsonResponse.data ?? jsonResponse) as T)
        : (jsonResponse as T);
    } catch (error) {
      console.error("Failed to parse JSON response body", error);
      return null;
    }
  }

  if (
    contentType.includes("text/csv") ||
    contentType.includes("application/xlsx") ||
    // BE Go xuất xlsx với MIME chuẩn `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    contentType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
  ) {
    try {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64") as T;
    } catch (error) {
      console.error("Failed to parse CSV/XLSX response body", error);
      return null;
    }
  }

  return null;
}

async function fetchWithRetry<T>(
  input: RequestInfo,
  init: ReqInit,
  retries = 0,
): Promise<FetchResult<T>> {
  try {
    const response = await fetch(input, init);
    const responseData = await parseResponse<T>(
      response,
      init.isKeyTransformEnabled,
    );

    if (response.status >= 500 && retries > 0)
      return await fetchWithRetry<T>(input, init, retries - 1);

    if (response.ok)
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: responseData as T,
      };

    const error = parseError(responseData);
    return {
      success: false,
      status: response.status,
      statusText: response.statusText,
      error,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      success: false,
      status: -1,
      statusText: "Data fetching error",
      error: { detail: "Data fetching error" },
    };
  }
}

function getSelectedHeaders() {
  const headersList = Object.fromEntries(headers().entries());
  const selectedHeaders = pickProps(headersList, [
    "user-agent",
    "referer",
    "x-next-intl-locale",
    "x-real-ip",
    "x-forwarded-for",
  ]) as Record<string, string>;

  return selectedHeaders;
}

async function getReqHeaders(init: ReqInit) {
  const [{ access_token }, { isLoggedIn }] = await Promise.all([
    getSession<AccessTokenData>("accessToken"),
    getSession<SessionData>("session"),
  ]);
  const selectedHeaders = getSelectedHeaders();
  const locale = selectedHeaders["x-next-intl-locale"] ?? "vi";
  const isFormData = init.payload instanceof FormData;
  const useBasicAuth = getFeatureFlags("useBasicAuth.enabled");

  let sanitizedHeaders = {};
  if (init.headers instanceof Headers) {
    sanitizedHeaders = Object.fromEntries(init.headers.entries());
  } else if (typeof init.headers === "object" && !Array.isArray(init.headers)) {
    sanitizedHeaders = init.headers;
  }

  const authorization = useBasicAuth
    ? `Basic ${access_token}`
    : `Bearer ${access_token}`;

  return {
    ...selectedHeaders,
    ...(isLoggedIn && { authorization }),
    "accept-language": locale,
    accept: "application/json",
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(!init.omitProjectIdHeader && {
      "project-id": cookies().get("projectId")?.value ?? "",
    }),
    "error-format": init.errorFormat ?? "flatten",
    ...sanitizedHeaders,
  };
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

function logRequest({
  reqInfo,
  init,
  response,
  responseTime,
  headers,
}: {
  reqInfo: RequestInfo;
  init: ReqInit;
  response: FetchResult<unknown>;
  responseTime: number;
  headers: Record<string, unknown>;
}) {
  const isDebugLogsEnabled = getFeatureFlags("debugLogs.enabled");
  if (!isDebugLogsEnabled) return;

  const requestId =
    (headers["X-REQUEST-ID"] as string) ||
    crypto.randomUUID().replace(/-/g, "");
  const url = typeof reqInfo === "string" ? reqInfo : reqInfo.url;
  const selectedHeaders = getSelectedHeaders();
  const remoteAddr = getBaseUrl(selectedHeaders.referer);
  const clientIp =
    selectedHeaders["x-real-ip"] ??
    selectedHeaders["x-forwarded-for"] ??
    remoteAddr;
  const reqBody = getReqBody(
    init.payload,
    init.isKeyTransformEnabled,
    init.isPascalCasePayload,
  );

  const logData = {
    timestamp: convertDateNow(),
    request_id: requestId,
    level: "info",
    method: init.method,
    url,
    client_ip: clientIp,
    referer: selectedHeaders.referer,
    user_agent: selectedHeaders["user-agent"],
    request_body: sanitizeObject(reqBody),
    status_code: response.status,
    response_time: Number(responseTime.toFixed(3)),
    response_body: sanitizeObject(response.data),
    error: response.error,
  };

  console.info(JSON.stringify(logData));
}

const BACKEND_URL = env.BACKEND_URL + "/";
const PROMETHEUS_URL = env.PROMETHEUS_URL;

function getBaseUrl(url?: string): string {
  if (!url) return "";
  const urlParts = url.split("/");
  return `${urlParts[0]}//${urlParts[2]}`;
}

const createApiInstance = (baseUrl: string) => ({
  get: <T>(
    endpoint: string,
    init: GetReqInit = {},
  ): Promise<FetchResult<T>> => {
    const { query, ...rest } = init;
    const queryString = query ? buildQueryString(query, true) : "";
    return fetcher<T>(baseUrl + endpoint + queryString, {
      ...rest,
      method: "GET",
    });
  },

  post: <T>(
    endpoint: string,
    init: ReqInit = {},
    tags: string[] = [],
  ): Promise<FetchResult<T>> => {
    const { payload, ...rest } = init;
    return fetcher(
      baseUrl + endpoint,
      {
        ...rest,
        payload,
        method: "POST",
      },
      0,
      tags,
    );
  },

  put: <T>(
    endpoint: string,
    init: ReqInit = {},
    tags: string[] = [],
  ): Promise<FetchResult<T>> => {
    const { payload, ...rest } = init;
    return fetcher(
      baseUrl + endpoint,
      {
        ...rest,
        payload,
        method: "PUT",
      },
      0,
      tags,
    );
  },

  delete: <T>(
    endpoint: string,
    init: ReqInit = {},
    tags: string[] = [],
  ): Promise<FetchResult<T>> => {
    return fetcher(
      baseUrl + endpoint,
      {
        ...init,
        method: "DELETE",
      },
      0,
      tags,
    );
  },

  patch: <T>(
    endpoint: string,
    init: PatchReqInit = {},
    tags: string[] = [],
  ): Promise<FetchResult<T>> => {
    const { payload, ...rest } = init;
    return fetcher(
      baseUrl + endpoint,
      {
        ...rest,
        payload,
        method: "PATCH",
      },
      0,
      tags,
    );
  },
});

export const apiInstance = createApiInstance(BACKEND_URL);

export const prometheusApiInstance = createApiInstance(PROMETHEUS_URL);

export function graphqlInstance<T>(init: ReqInit): Promise<FetchResult<T>> {
  const { payload, ...rest } = init;

  const reqInit: RequestInit = {
    ...rest,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snakifyObject(payload)),
    method: "POST",
  };

  return fetchWithRetry<T>(env.GRAPHQL_URL, reqInit);
}
