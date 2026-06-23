package dto

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   interface{} `json:"error"`
}

func NewSuccessResponse(data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
		Error:   nil,
	}
}

func NewErrorResponse(errCode string) APIResponse {
	return APIResponse{
		Success: false,
		Data:    nil,
		Error:   errCode,
	}
}
