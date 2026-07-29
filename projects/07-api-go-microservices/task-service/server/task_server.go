package server

import (
	"taskflow/shared/models"
	"taskflow/task-service/repository"
)

type TaskServer struct {
	repo *repository.TaskRepository
}

func NewTaskServer(repo *repository.TaskRepository) *TaskServer {
	return &TaskServer{repo: repo}
}

func (s *TaskServer) ListTasks(params repository.TaskFilterParams) ([]models.Task, int, error) {
	return s.repo.ListTasks(params)
}

func (s *TaskServer) GetTaskByID(id, userID string) (*models.Task, error) {
	return s.repo.GetTaskByID(id, userID)
}

func (s *TaskServer) CreateTask(userID, title, description, status, priority, category string, tags []string, dueDate string) (*models.Task, error) {
	return s.repo.CreateTask(userID, title, description, status, priority, category, tags, dueDate)
}

func (s *TaskServer) UpdateTask(id, userID string, updates map[string]interface{}) (*models.Task, error) {
	return s.repo.UpdateTask(id, userID, updates)
}

func (s *TaskServer) DeleteTask(id, userID string) error {
	return s.repo.DeleteTask(id, userID)
}

func (s *TaskServer) BulkDelete(userID string, taskIDs []string) (int, error) {
	return s.repo.BulkDelete(userID, taskIDs)
}

func (s *TaskServer) BulkUpdateStatus(userID string, taskIDs []string, status string) (int, error) {
	return s.repo.BulkUpdateStatus(userID, taskIDs, status)
}

func (s *TaskServer) GetCategories(userID string) ([]string, error) {
	return s.repo.GetCategories(userID)
}

func (s *TaskServer) CreateSubtask(userID, taskID, title string) (*models.Subtask, error) {
	return s.repo.CreateSubtask(userID, taskID, title)
}

func (s *TaskServer) UpdateSubtask(userID, taskID, subtaskID string, completed bool) (*models.Subtask, error) {
	return s.repo.UpdateSubtask(userID, taskID, subtaskID, completed)
}

func (s *TaskServer) DeleteSubtask(userID, taskID, subtaskID string) error {
	return s.repo.DeleteSubtask(userID, taskID, subtaskID)
}

func (s *TaskServer) SaveFileResource(userID, taskID, filename, contentType string, sizeBytes int64, filePath string) (*models.FileResource, error) {
	return s.repo.SaveFileResource(userID, taskID, filename, contentType, sizeBytes, filePath)
}

func (s *TaskServer) GetFileResourceByID(fileID string) (*models.FileResource, error) {
	return s.repo.GetFileResourceByID(fileID)
}

func (s *TaskServer) GetAnalytics(userID string) (*models.AnalyticsData, error) {
	return s.repo.GetAnalytics(userID)
}