import { jwtDecode } from "jwt-decode";

// Tính `expires_at` (epoch giây) cho session bám theo `exp` THẬT của access
// token JWT, trừ đi `bufferSeconds` để middleware gọi refresh TRƯỚC khi token
// chết (lúc đó token vẫn hợp lệ để xác thực request refresh).
//
// Trước đây session hardcode `now + 3600` (1h) trong khi JWT thật sống 30m →
// FE refresh quá muộn (token đã chết) → refresh thất bại, người dùng bị logout.
// Bám theo `exp` thật khắc phục lệch hạn này.
//
// Fallback về `now + fallbackSeconds` nếu token không phải JWT / không có `exp`.
export function accessTokenExpiresAt(
  accessToken: string,
  fallbackSeconds = 3600,
  bufferSeconds = 60,
): number {
  const now = Math.floor(Date.now() / 1000);
  try {
    const { exp } = jwtDecode<{ exp?: number }>(accessToken);
    if (exp && exp > now) {
      // Không để expires_at lùi quá hiện tại (token sắp hết hạn) → tối thiểu now.
      return Math.max(now, exp - bufferSeconds);
    }
  } catch {
    // token không decode được → dùng fallback
  }
  return now + fallbackSeconds;
}
