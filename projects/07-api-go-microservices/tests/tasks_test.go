package tests

import (
	"testing"

	taskRepo "taskflow/task-service/repository"
)

func TestTaskCRUDAndFiltering(t *testing.T) {
	uSvc, tSvc := setupTestServices(t)

	userRes, err := uSvc.Register("Task Admin", "admin@taskflow.dev", "Password123!")
	if err != nil {
		t.Fatalf("Failed user registration: %v", err)
	}

	task1, err := tSvc.CreateTask(userRes.User.ID, "Implement Go Fiber Gateway", "Setup proxy handlers", "in_progress", "urgent", "Backend", []string{"#go", "#fiber"}, "2026-08-01")
	if err != nil {
		t.Fatalf("Failed to create task1: %v", err)
	}

	if task1.Title != "Implement Go Fiber Gateway" {
		t.Errorf("Expected title 'Implement Go Fiber Gateway', got '%s'", task1.Title)
	}

	task2, err := tSvc.CreateTask(userRes.User.ID, "Database Schema Setup", "Configure SQLite GORM", "todo", "high", "Database", []string{"#gorm", "#sqlite"}, "2026-08-05")
	if err != nil {
		t.Fatalf("Failed to create task2: %v", err)
	}

	tasks, total, err := tSvc.ListTasks(taskRepo.TaskFilterParams{
		UserID: userRes.User.ID,
		Page:   1,
		Limit:  10,
	})
	if err != nil {
		t.Fatalf("ListTasks failed: %v", err)
	}

	if total != 2 || len(tasks) != 2 {
		t.Errorf("Expected 2 total tasks, got %d", total)
	}

	// Test Dynamic Category Discovery
	categories, err := tSvc.GetCategories(userRes.User.ID)
	if err != nil {
		t.Fatalf("GetCategories failed: %v", err)
	}

	if len(categories) != 2 {
		t.Errorf("Expected 2 categories (Backend, Database), got %d", len(categories))
	}

	// Test Subtask creation and toggle
	subtask, err := tSvc.CreateSubtask(userRes.User.ID, task1.ID, "Verify CORS middleware")
	if err != nil {
		t.Fatalf("CreateSubtask failed: %v", err)
	}

	if subtask.Completed {
		t.Errorf("Expected initial completed state false")
	}

	updatedSubtask, err := tSvc.UpdateSubtask(userRes.User.ID, task1.ID, subtask.ID, true)
	if err != nil {
		t.Fatalf("UpdateSubtask failed: %v", err)
	}

	if !updatedSubtask.Completed {
		t.Errorf("Expected completed state true")
	}

	// Test Bulk Update Status
	count, err := tSvc.BulkUpdateStatus(userRes.User.ID, []string{task1.ID, task2.ID}, "completed")
	if err != nil || count != 2 {
		t.Fatalf("BulkUpdateStatus failed: count=%d, err=%v", count, err)
	}

	// Test Analytics Calculation
	analytics, err := tSvc.GetAnalytics(userRes.User.ID)
	if err != nil {
		t.Fatalf("GetAnalytics failed: %v", err)
	}

	if analytics.CompletedTasks != 2 || analytics.CompletionRate != 100.0 {
		t.Errorf("Expected 100.0 completion rate, got %f", analytics.CompletionRate)
	}
}