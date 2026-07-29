package tests

import (
	"testing"
	"time"

	taskRepo "taskflow/task-service/repository"
	taskServer "taskflow/task-service/server"
	userRepo "taskflow/user-service/repository"
	userServer "taskflow/user-service/server"
)

func setupTestServices(t *testing.T) (*userServer.UserServer, *taskServer.TaskServer) {
	uRepo, err := userRepo.NewUserRepository(":memory:")
	if err != nil {
		t.Fatalf("Failed to init user memory repo: %v", err)
	}
	uSvc := userServer.NewUserServer(uRepo)

	tRepo, err := taskRepo.NewTaskRepository(":memory:")
	if err != nil {
		t.Fatalf("Failed to init task memory repo: %v", err)
	}
	tSvc := taskServer.NewTaskServer(tRepo)

	return uSvc, tSvc
}

func TestUserRegistrationAndLogin(t *testing.T) {
	uSvc, _ := setupTestServices(t)

	res, err := uSvc.Register("Test Developer", "dev@taskflow.dev", "Password123!")
	if err != nil {
		t.Fatalf("Registration failed: %v", err)
	}

	if res.User.Email != "dev@taskflow.dev" {
		t.Errorf("Expected email dev@taskflow.dev, got %s", res.User.Email)
	}

	if res.AccessToken == "" || res.RefreshToken == "" {
		t.Errorf("Expected non-empty access and refresh tokens")
	}

	loginRes, err := uSvc.Login("dev@taskflow.dev", "Password123!")
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}

	if loginRes.User.ID != res.User.ID {
		t.Errorf("Mismatch user ID in login result")
	}
}

func TestTokenRefreshAndLogout(t *testing.T) {
	uSvc, _ := setupTestServices(t)

	regRes, err := uSvc.Register("Test User", "test@taskflow.dev", "Password123!")
	if err != nil {
		t.Fatalf("Registration failed: %v", err)
	}

	time.Sleep(10 * time.Millisecond)

	newAccToken, err := uSvc.RefreshToken(regRes.RefreshToken)
	if err != nil {
		t.Fatalf("Refresh token failed: %v", err)
	}

	if newAccToken == "" {
		t.Errorf("Expected valid new access token")
	}

	err = uSvc.Logout(regRes.RefreshToken)
	if err != nil {
		t.Fatalf("Logout failed: %v", err)
	}

	_, err = uSvc.RefreshToken(regRes.RefreshToken)
	if err == nil {
		t.Errorf("Expected error when refreshing revoked token")
	}
}