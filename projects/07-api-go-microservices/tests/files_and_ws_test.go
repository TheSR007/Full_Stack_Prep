package tests

import (
	"testing"

	"taskflow/api-gateway/handlers"
)

func TestFileResourceAndWebSocketHub(t *testing.T) {
	uSvc, tSvc := setupTestServices(t)

	userRes, err := uSvc.Register("File Admin", "files@taskflow.dev", "Password123!")
	if err != nil {
		t.Fatalf("Registration failed: %v", err)
	}

	task, err := tSvc.CreateTask(userRes.User.ID, "File Attachment Task", "Testing file attachment upload", "todo", "medium", "General", []string{}, "")
	if err != nil {
		t.Fatalf("Task creation failed: %v", err)
	}

	fileRes, err := tSvc.SaveFileResource(userRes.User.ID, task.ID, "architecture.png", "image/png", 1024, "/uploads/architecture.png")
	if err != nil {
		t.Fatalf("SaveFileResource failed: %v", err)
	}

	fetchedRes, err := tSvc.GetFileResourceByID(fileRes.ID)
	if err != nil || fetchedRes.Filename != "architecture.png" {
		t.Fatalf("GetFileResourceByID failed: %v", err)
	}

	// Test WebSocket Hub initialization and broadcast
	wsHub := handlers.NewWebSocketHub()
	if wsHub == nil {
		t.Fatalf("Failed to initialize WebSocket Hub")
	}

	wsHub.Broadcast(map[string]string{"type": "PING"})
}