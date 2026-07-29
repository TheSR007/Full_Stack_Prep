package server

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"taskflow/shared/models"
	"taskflow/user-service/repository"
)

var JWTSecret = []byte("taskflow-super-secret-jwt-key-2026")

type UserServer struct {
	repo *repository.UserRepository
}

func NewUserServer(repo *repository.UserRepository) *UserServer {
	return &UserServer{repo: repo}
}

type AuthResult struct {
	User         *models.User
	AccessToken  string
	RefreshToken string
}

func (s *UserServer) Register(name, email, password string) (*AuthResult, error) {
	user, err := s.repo.CreateUser(name, email, password)
	if err != nil {
		return nil, err
	}

	accToken, refToken, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		User:         user,
		AccessToken:  accToken,
		RefreshToken: refToken,
	}, nil
}

func (s *UserServer) Login(email, password string) (*AuthResult, error) {
	user, err := s.repo.AuthenticateUser(email, password)
	if err != nil {
		return nil, err
	}

	accToken, refToken, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		User:         user,
		AccessToken:  accToken,
		RefreshToken: refToken,
	}, nil
}

func (s *UserServer) RefreshToken(refTokenStr string) (string, error) {
	refToken, err := s.repo.ValidateRefreshToken(refTokenStr)
	if err != nil {
		return "", err
	}

	user, err := s.repo.GetUserByID(refToken.UserID)
	if err != nil {
		return "", err
	}

	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

func (s *UserServer) Logout(refTokenStr string) error {
	return s.repo.RevokeRefreshToken(refTokenStr)
}

func (s *UserServer) GetUser(userID string) (*models.User, error) {
	return s.repo.GetUserByID(userID)
}

func (s *UserServer) generateTokens(user *models.User) (string, string, error) {
	accClaims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(15 * time.Minute).Unix(),
	}
	accTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, accClaims)
	accToken, err := accTokenObj.SignedString(JWTSecret)
	if err != nil {
		return "", "", err
	}

	refTokenStr := uuid.New().String() + "." + uuid.New().String()
	exp := time.Now().Add(7 * 24 * time.Hour)

	if err := s.repo.SaveRefreshToken(user.ID, refTokenStr, exp); err != nil {
		return "", "", err
	}

	return accToken, refTokenStr, nil
}

func ValidateAccessToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return JWTSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}