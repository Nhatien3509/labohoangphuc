/** Map mã lỗi backend (internal/domain/errors) -> thông điệp tiếng Việt cho UI. */
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CODE_FORMAT: "Mã thẻ không đúng định dạng.",
  WARRANTY_NOT_FOUND: "Không tìm thấy thẻ bảo hành với mã này.",
  CODE_DUPLICATED: "Mã thẻ đã tồn tại.",
  NETWORK_ERROR: "Không kết nối được máy chủ. Vui lòng thử lại.",
  INTERNAL_SERVER_ERROR: "Lỗi hệ thống. Vui lòng thử lại sau.",
};

export function errorMessage(code?: string): string {
  if (!code) return ERROR_MESSAGES.INTERNAL_SERVER_ERROR!;
  return ERROR_MESSAGES[code] ?? code;
}

/** Nhãn trạng thái thẻ bảo hành. */
export const WARRANTY_STATUS_LABEL: Record<string, string> = {
  active: "Đang hiệu lực",
  expired: "Hết hạn",
  revoked: "Đã thu hồi",
};
