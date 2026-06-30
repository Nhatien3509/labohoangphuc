"use server";

import { apiInstance } from "@/api/instance";
import { clearSession, setSession } from "@/api/session";

import type {
  AuthActionResult,
  ChangePasswordPayload,
  LoginPayload,
  TokenResponse,
} from "./types";

/**
 * Đăng nhập: gọi BE, lưu access/refresh token vào cookie httpOnly.
 * BE: POST /api/v1/auth/login.
 */
export async function loginAction(
  payload: LoginPayload,
): Promise<AuthActionResult> {
  const res = await apiInstance.post<TokenResponse>("auth/login", {
    payload: { ...payload },
  });

  if (res.success && res.data) {
    setSession(res.data);
    return { success: true };
  }
  return { success: false, error: res.error };
}

/**
 * Đăng xuất: gọi BE để xoá refresh token, sau đó xoá cookie phiên.
 * BE: POST /api/v1/auth/logout (cần Bearer). Luôn xoá cookie ở FE dù BE lỗi.
 */
export async function logoutAction(): Promise<AuthActionResult> {
  await apiInstance.post("auth/logout", { auth: true });
  clearSession();
  return { success: true };
}

/**
 * Đổi mật khẩu. BE: POST /api/v1/auth/change-password (cần Bearer).
 */
export async function changePasswordAction(
  payload: ChangePasswordPayload,
): Promise<AuthActionResult> {
  const res = await apiInstance.post("auth/change-password", {
    auth: true,
    payload: { ...payload },
  });

  if (res.success) return { success: true };
  return { success: false, error: res.error };
}
