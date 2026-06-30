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
	ErrUserNotFound        = errors.New("người dùng không tồn tại")
	ErrInvalidPassword     = errors.New("mật khẩu không chính xác")
	ErrEmailAlreadyExist   = errors.New("địa chỉ email này đã được đăng ký")
	ErrUnauthorized        = errors.New("phiên làm việc hết hạn hoặc không hợp lệ")
	ErrDisable             = errors.New("tài khoản đã bị khoá")
	ErrResponse            = errors.New("UNAUTHORIZED: Missing Authorization Header")
	ErrMissingUser         = errors.New("UNAUTHORIZED: Missing user session")
	ErrInvalidUser         = errors.New("INTERNAL_SERVER_ERROR: Invalid user identity format")
	ErrSessionNotFound     = errors.New("UNAUTHORIZED: Phiên làm việc không tồn tại")
	ErrLogout              = errors.New("Hệ thống không thể xử lý yêu cầu đăng xuất lúc này")
	ErrHashPassWord        = errors.New("lỗi hệ thống khi mã hóa mật khẩu mới")
	ErrUpdatePassWord      = errors.New("không thể cập nhật mật khẩu mới vào cơ sở dữ liệu")
	ErrInvalidInput        = errors.New("giá trị đầu vào không hợp lệ")
	ErrInvalidRefreshToken = errors.New("refresh token không hợp lệ hoặc đã hết hạn")
	ErrValidate            = errors.New("Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.")
)

// ==============================================================================
// INFRASTRUCTURE ERRORS
// ==============================================================================
var (
	ErrInternalServer = errors.New("lỗi hệ thống từ phía máy chủ")
)
