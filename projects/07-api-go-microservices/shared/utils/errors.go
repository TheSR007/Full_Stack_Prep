package utils

const (
	ErrUnauthorized        = "UNAUTHORIZED"
	ErrForbidden           = "FORBIDDEN"
	ErrNotFound            = "NOT_FOUND"
	ErrValidationError     = "VALIDATION_ERROR"
	ErrConflict            = "CONFLICT"
	ErrRateLimited         = "RATE_LIMITED"
	ErrInternalServerError = "INTERNAL_SERVER_ERROR"
)

type APIError struct {
	Code       string
	Message    string
	StatusCode int
	Details    []ErrorDetail
}

func (e *APIError) Error() string {
	return e.Message
}

func NewAPIError(code, message string, statusCode int, details ...ErrorDetail) *APIError {
	return &APIError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
		Details:    details,
	}
}