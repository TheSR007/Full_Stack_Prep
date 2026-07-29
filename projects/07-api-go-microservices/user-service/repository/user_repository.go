package repository

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"taskflow/shared/models"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(dbPath string) (*UserRepository, error) {
	if dbPath == "" {
		dbPath = "taskflow_users.db"
	}
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(&models.User{}, &models.RefreshToken{})
	if err != nil {
		return nil, err
	}

	return &UserRepository{db: db}, nil
}

func (r *UserRepository) CreateUser(name, email, plainPassword string) (*models.User, error) {
	var existing models.User
	if err := r.db.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, errors.New("user with this email already exists")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        "u_" + uuid.New().String(),
		Email:     email,
		Password:  string(hashed),
		Name:      name,
		Role:      "USER",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := r.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) AuthenticateUser(email, plainPassword string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(plainPassword)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	return &user, nil
}

func (r *UserRepository) GetUserByID(id string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func (r *UserRepository) SaveRefreshToken(userID, tokenStr string, expiresAt time.Time) error {
	token := &models.RefreshToken{
		ID:        "rt_" + uuid.New().String(),
		UserID:    userID,
		Token:     tokenStr,
		ExpiresAt: expiresAt,
		Revoked:   false,
		CreatedAt: time.Now(),
	}
	return r.db.Create(token).Error
}

func (r *UserRepository) ValidateRefreshToken(tokenStr string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	if err := r.db.Where("token = ? AND revoked = false AND expires_at > ?", tokenStr, time.Now()).First(&token).Error; err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}
	return &token, nil
}

func (r *UserRepository) RevokeRefreshToken(tokenStr string) error {
	return r.db.Model(&models.RefreshToken{}).Where("token = ?", tokenStr).Update("revoked", true).Error
}