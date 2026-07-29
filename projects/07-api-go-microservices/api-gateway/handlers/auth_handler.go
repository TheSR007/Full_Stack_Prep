package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"taskflow/api-gateway/middleware"
	"taskflow/shared/utils"
	userServer "taskflow/user-service/server"
)

type AuthHandler struct {
	userSvc *userServer.UserServer
}

func NewAuthHandler(userSvc *userServer.UserServer) *AuthHandler {
	return &AuthHandler{userSvc: userSvc}
}

type RegisterDTO struct {
	Email    string `json:"email" example:"developer@taskflow.dev"`
	Password string `json:"password" example:"SecurePassword123!"`
	Name     string `json:"name" example:"Dev User"`
}

type LoginDTO struct {
	Email    string `json:"email" example:"developer@taskflow.dev"`
	Password string `json:"password" example:"SecurePassword123!"`
}

type SingleEnvelopeDTO struct {
	Success bool        `json:"success" example:"true"`
	Data    interface{} `json:"data"`
}

type ErrorEnvelopeDTO struct {
	Success bool        `json:"success" example:"false"`
	Error   interface{} `json:"error"`
}

// Register godoc
// @Summary      Register User
// @Description  Create a new user account and set refresh cookie
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        body body RegisterDTO true "User registration details"
// @Success      201  {object} SingleEnvelopeDTO
// @Failure      400  {object} ErrorEnvelopeDTO
// @Failure      409  {object} ErrorEnvelopeDTO
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var dto RegisterDTO
	if err := c.BodyParser(&dto); err != nil || dto.Email == "" || dto.Password == "" || dto.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Invalid registration request payload",
			[]utils.ErrorDetail{{Field: "body", Message: "email, password, and name are required"}},
		))
	}

	result, err := h.userSvc.Register(dto.Name, dto.Email, dto.Password)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrConflict,
			err.Error(),
			nil,
		))
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    result.RefreshToken,
		Path:     "/api/v1/auth",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusCreated).JSON(utils.SuccessResponse(fiber.Map{
		"user":        result.User,
		"accessToken": result.AccessToken,
	}))
}

// Login godoc
// @Summary      Login User
// @Description  Authenticate user email and password
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        body body LoginDTO true "Login credentials"
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      401  {object} ErrorEnvelopeDTO
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var dto LoginDTO
	if err := c.BodyParser(&dto); err != nil || dto.Email == "" || dto.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Invalid login request payload",
			[]utils.ErrorDetail{{Field: "body", Message: "email and password are required"}},
		))
	}

	result, err := h.userSvc.Login(dto.Email, dto.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
			utils.ErrUnauthorized,
			err.Error(),
			nil,
		))
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    result.RefreshToken,
		Path:     "/api/v1/auth",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"user":        result.User,
		"accessToken": result.AccessToken,
	}))
}

// Refresh godoc
// @Summary      Refresh Access Token
// @Description  Obtain a new access token using HttpOnly refresh cookie
// @Tags         Authentication
// @Produce      json
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      401  {object} ErrorEnvelopeDTO
// @Router       /auth/refresh [post]
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	refToken := c.Cookies("refreshToken")
	if refToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
			utils.ErrUnauthorized,
			"Missing refresh token cookie",
			nil,
		))
	}

	newAccessToken, err := h.userSvc.RefreshToken(refToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(utils.BuildErrorResponse(
			utils.ErrUnauthorized,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"accessToken": newAccessToken,
	}))
}

// Logout godoc
// @Summary      Logout User
// @Description  Revoke refresh token and clear cookie
// @Tags         Authentication
// @Security     Bearer
// @Produce      json
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	refToken := c.Cookies("refreshToken")
	if refToken != "" {
		_ = h.userSvc.Logout(refToken)
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Path:     "/api/v1/auth",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"message": "Successfully logged out",
	}))
}

// Me godoc
// @Summary      Get Current User Profile
// @Description  Fetch identity details of authenticated user
// @Tags         Authentication
// @Security     Bearer
// @Produce      json
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      404  {object} ErrorEnvelopeDTO
// @Router       /auth/me [get]
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	user, err := h.userSvc.GetUser(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			"User not found",
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(user))
}