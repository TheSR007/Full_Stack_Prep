package utils

type Meta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type ErrorDetail struct {
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
}

type ErrorBody struct {
	Code    string        `json:"code"`
	Message string        `json:"message"`
	Details []ErrorDetail `json:"details,omitempty"`
}

type SingleEnvelope struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

type PaginatedEnvelope struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    Meta        `json:"meta"`
}

type ErrorEnvelope struct {
	Success bool      `json:"success"`
	Error   ErrorBody `json:"error"`
}

func SuccessResponse(data interface{}) SingleEnvelope {
	return SingleEnvelope{
		Success: true,
		Data:    data,
	}
}

func PaginatedResponse(data interface{}, page, limit, total int) PaginatedEnvelope {
	totalPages := 0
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}
	return PaginatedEnvelope{
		Success: true,
		Data:    data,
		Meta: Meta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}

func BuildErrorResponse(code, message string, details []ErrorDetail) ErrorEnvelope {
	return ErrorEnvelope{
		Success: false,
		Error: ErrorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
}