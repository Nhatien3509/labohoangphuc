import {
  type FlattenError,
  type NestedObject,
} from "@common/components/containers/ErrorToast";

export interface ReqInit extends RequestInit {
  omitProjectIdHeader?: boolean;
  errorFormat?: "flatten" | "original";
  payload?: Record<string, unknown> | Record<string, unknown>[] | FormData;
  isKeyTransformEnabled?: boolean;
  isPascalCasePayload?: boolean;
}

export interface GetReqInit extends ReqInit {
  query?: Record<string, string | number | boolean | (string | number)[]>;
}

export interface PatchReqInit extends ReqInit {
  payload?: Record<string, unknown>;
}

export interface FetchResult<T> {
  success: boolean;
  status: number;
  statusText?: string;
  data?: T;
  error?: ApiError | FlattenError[];
  shouldRefresh?: boolean;
}

export interface GETResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string | NestedObject;
  dependantObjects?: Record<string, string>[];
  // Định dạng lỗi nghiệp vụ của BE Go (Vietnamese portal):
  // { errorCode, message: { vi, en }, description }
  errorCode?: number;
  message?: string | { vi?: string; en?: string };
  description?: string;
}
