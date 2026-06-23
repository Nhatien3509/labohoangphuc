package errors

import "errors"

// ==============================================================================
// WARRANTY CARD ERRORS
// ==============================================================================
var (
	ErrCardNotFound      = errors.New("thẻ bảo hành không tồn tại trên hệ thống")
	ErrCardExpired       = errors.New("thẻ bảo hành này đã hết hạn")
	ErrCardLocked        = errors.New("thẻ bảo hành đã bị khóa hoặc tạm ngưng kích hoạt")
	ErrDuplicateCardCode = errors.New("mã số thẻ bảo hành này đã tồn tại")
	ErrInvalidCodeFormat = errors.New("không đúng định dạng code")
)

// ==============================================================================
// AUTHENTICATION & USER ERRORS
// ==============================================================================
var (
	ErrUserNotFound      = errors.New("người dùng không tồn tại")
	ErrInvalidPassword   = errors.New("mật khẩu không chính xác")
	ErrEmailAlreadyExist = errors.New("địa chỉ email này đã được đăng ký")
	ErrUnauthorized      = errors.New("phiên làm việc hết hạn hoặc không hợp lệ")
)

// ==============================================================================
// INFRASTRUCTURE ERRORS
// ==============================================================================
var (
	ErrInternalServer = errors.New("lỗi hệ thống từ phía máy chủ")
	ErrRedisDown      = errors.New("không thể kết nối tới bộ nhớ đệm cache")
)
