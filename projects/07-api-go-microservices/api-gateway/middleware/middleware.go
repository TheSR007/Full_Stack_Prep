package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"taskflow/shared/utils"
	userServer "taskflow/user-service/server"
)

const UserContextKey = "userID"

func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
				utils.ErrUnauthorized,
				"Missing or invalid access token",
				nil,
			))
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := userServer.ValidateAccessToken(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
				utils.ErrUnauthorized,
				"Invalid or expired access token",
				nil,
			))
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
				utils.ErrUnauthorized,
				"Invalid token identity",
				nil,
			))
		}

		c.Locals(UserContextKey, userID)
		return c.Next()
	}
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	errCode := utils.ErrInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		switch code {
		case fiber.StatusNotFound:
			errCode = utils.ErrNotFound
		case fiber.StatusBadRequest:
			errCode = utils.ErrValidationError
		case fiber.StatusUnauthorized:
			errCode = utils.ErrUnauthorized
		case fiber.StatusForbidden:
			errCode = utils.ErrForbidden
		}
	}

	return c.Status(code).JSON(utils.BuildErrorResponse(
		errCode,
		err.Error(),
		nil,
	))
}