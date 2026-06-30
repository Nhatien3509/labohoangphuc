/**
 * Hằng số cho phiên đăng nhập — tách riêng để dùng được cả ở Edge middleware
 * (không import `next/headers`).
 */
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
