/**
 * Kiểu dữ liệu cho tầng HTTP client.
 *
 * Backend Go (labo-warranty) trả về bao envelope thống nhất:
 *   { "success": boolean, "data": <payload> | null, "error": <string mã lỗi> | null }
 * (xem internal/domain/dto/warranty_response.go).
 */

export interface ReqInit extends RequestInit {
  /** Body JSON sẽ được JSON.stringify trước khi gửi. */
  payload?: Record<string, unknown> | Record<string, unknown>[];
  /**
   * Gắn `Authorization: Bearer <access_token>` đọc từ cookie phiên đăng nhập.
   * Dùng cho các endpoint admin / auth cần xác thực.
   */
  auth?: boolean;
}

export interface GetReqInit extends Omit<ReqInit, "payload"> {
  /** Tham số query, tự build thành ?a=1&b=2. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

/** Bao envelope đúng như backend Go trả về. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/** Kết quả chuẩn hoá mà mọi caller nhận được từ apiInstance. */
export interface FetchResult<T> {
  success: boolean;
  status: number;
  statusText?: string;
  data?: T;
  /** Mã lỗi nghiệp vụ từ backend (vd: WARRANTY_NOT_FOUND, CODE_DUPLICATED). */
  error?: string;
}
