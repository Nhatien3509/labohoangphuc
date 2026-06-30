/**
 * Kiểu dữ liệu cho luồng xác thực.
 * Khớp các DTO backend (internal/domain/dto/auth_dto.go).
 */

/** POST /api/v1/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Dữ liệu trả về của login: dto.TokenResponse. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

/** POST /api/v1/auth/change-password */
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

/** Kết quả chuẩn cho server action auth (hiển thị thông điệp lỗi từ BE). */
export interface AuthActionResult {
  success: boolean;
  /** Thông điệp lỗi (BE trả chuỗi tiếng Việt cho nhóm auth). */
  error?: string;
}
