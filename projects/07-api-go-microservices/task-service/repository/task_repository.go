package repository

import (
	"errors"
	"math"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"taskflow/shared/models"
)

type TaskFilterParams struct {
	UserID    string
	Search    string
	Status    string
	Priority  string
	Category  string
	Tag       string
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
}

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(dbPath string) (*TaskRepository, error) {
	if dbPath == "" {
		dbPath = "taskflow_tasks.db"
	}
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(&models.Task{}, &models.Subtask{}, &models.TaskHistory{}, &models.FileResource{})
	if err != nil {
		return nil, err
	}

	return &TaskRepository{db: db}, nil
}

func (r *TaskRepository) ListTasks(params TaskFilterParams) ([]models.Task, int, error) {
	query := r.db.Model(&models.Task{}).Preload("Subtasks").Preload("History").Preload("Attachments").Where("user_id = ?", params.UserID)

	if params.Status != "" && params.Status != "all" {
		query = query.Where("status = ?", params.Status)
	}

	if params.Priority != "" && params.Priority != "all" {
		query = query.Where("priority = ?", params.Priority)
	}

	if params.Category != "" && params.Category != "all" {
		query = query.Where("category = ?", params.Category)
	}

	if params.Search != "" {
		searchTerm := "%" + strings.ToLower(params.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	var total64 int64
	if err := query.Count(&total64).Error; err != nil {
		return nil, 0, err
	}
	total := int(total64)

	var tasks []models.Task

	orderClause := "created_at DESC"
	if params.SortBy != "" {
		dir := "DESC"
		if strings.ToLower(params.SortOrder) == "asc" {
			dir = "ASC"
		}
		switch params.SortBy {
		case "dueDate":
			orderClause = "due_date " + dir
		case "title":
			orderClause = "title " + dir
		case "priorityWeight":
			orderClause = "CASE priority WHEN 'urgent' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END " + dir
		case "createdAt":
			orderClause = "created_at " + dir
		}
	}
	query = query.Order(orderClause)

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 {
		params.Limit = 50
	}
	offset := (params.Page - 1) * params.Limit

	if err := query.Offset(offset).Limit(params.Limit).Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	if params.Tag != "" {
		tagNeedle := strings.ToLower(params.Tag)
		var filtered []models.Task
		for _, t := range tasks {
			for _, tag := range t.Tags {
				if strings.ToLower(tag) == tagNeedle {
					filtered = append(filtered, t)
					break
				}
			}
		}
		tasks = filtered
	}

	for i := range tasks {
		if tasks[i].Subtasks == nil {
			tasks[i].Subtasks = []models.Subtask{}
		}
		if tasks[i].History == nil {
			tasks[i].History = []models.TaskHistory{}
		}
		if tasks[i].Attachments == nil {
			tasks[i].Attachments = []models.FileResource{}
		}
	}

	return tasks, total, nil
}

func (r *TaskRepository) GetTaskByID(id, userID string) (*models.Task, error) {
	var task models.Task
	if err := r.db.Preload("Subtasks").Preload("History").Preload("Attachments").Where("id = ? AND user_id = ?", id, userID).First(&task).Error; err != nil {
		return nil, errors.New("task not found")
	}
	if task.Subtasks == nil {
		task.Subtasks = []models.Subtask{}
	}
	if task.History == nil {
		task.History = []models.TaskHistory{}
	}
	if task.Attachments == nil {
		task.Attachments = []models.FileResource{}
	}
	return &task, nil
}

func (r *TaskRepository) CreateTask(userID, title, description, status, priority, category string, tags []string, dueDate string) (*models.Task, error) {
	if status == "" {
		status = "todo"
	}
	if priority == "" {
		priority = "medium"
	}
	if category == "" {
		category = "General"
	}
	if tags == nil {
		tags = []string{}
	}

	now := time.Now()
	task := &models.Task{
		ID:          "t_" + uuid.New().String()[:8],
		UserID:      userID,
		Title:       title,
		Description: description,
		Status:      status,
		Priority:    priority,
		Category:    category,
		Tags:        tags,
		DueDate:     dueDate,
		CreatedAt:   now,
		UpdatedAt:   now,
		Subtasks:    []models.Subtask{},
		History:     []models.TaskHistory{},
		Attachments: []models.FileResource{},
	}

	if err := r.db.Create(task).Error; err != nil {
		return nil, err
	}

	history := models.TaskHistory{
		ID:        "h_" + uuid.New().String()[:8],
		TaskID:    task.ID,
		Text:      "Task created",
		Timestamp: now,
	}
	r.db.Create(&history)
	task.History = append(task.History, history)

	return task, nil
}

func (r *TaskRepository) UpdateTask(id, userID string, updates map[string]interface{}) (*models.Task, error) {
	task, err := r.GetTaskByID(id, userID)
	if err != nil {
		return nil, err
	}

	updates["updated_at"] = time.Now()
	if err := r.db.Model(task).Updates(updates).Error; err != nil {
		return nil, err
	}

	if statusVal, ok := updates["status"]; ok && statusVal != task.Status {
		hist := models.TaskHistory{
			ID:        "h_" + uuid.New().String()[:8],
			TaskID:    task.ID,
			Text:      "Status changed to " + statusVal.(string),
			Timestamp: time.Now(),
		}
		r.db.Create(&hist)
	}

	return r.GetTaskByID(id, userID)
}

func (r *TaskRepository) DeleteTask(id, userID string) error {
	task, err := r.GetTaskByID(id, userID)
	if err != nil {
		return err
	}
	return r.db.Delete(task).Error
}

func (r *TaskRepository) BulkDelete(userID string, taskIDs []string) (int, error) {
	res := r.db.Where("user_id = ? AND id IN ?", userID, taskIDs).Delete(&models.Task{})
	if res.Error != nil {
		return 0, res.Error
	}
	return int(res.RowsAffected), nil
}

func (r *TaskRepository) BulkUpdateStatus(userID string, taskIDs []string, status string) (int, error) {
	res := r.db.Model(&models.Task{}).Where("user_id = ? AND id IN ?", userID, taskIDs).Updates(map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	})
	if res.Error != nil {
		return 0, res.Error
	}
	return int(res.RowsAffected), nil
}

func (r *TaskRepository) GetCategories(userID string) ([]string, error) {
	var categories []string
	err := r.db.Model(&models.Task{}).Where("user_id = ?", userID).Pluck("DISTINCT category", &categories).Error
	if err != nil {
		return nil, err
	}

	catMap := make(map[string]string)
	for _, c := range categories {
		if c == "" {
			continue
		}
		lower := strings.ToLower(c)
		if _, exists := catMap[lower]; !exists {
			catMap[lower] = c
		}
	}

	var result []string
	for _, orig := range catMap {
		result = append(result, orig)
	}
	sort.Strings(result)

	return result, nil
}

func (r *TaskRepository) CreateSubtask(userID, taskID, title string) (*models.Subtask, error) {
	_, err := r.GetTaskByID(taskID, userID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	subtask := &models.Subtask{
		ID:        "st_" + uuid.New().String()[:8],
		TaskID:    taskID,
		Title:     title,
		Completed: false,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := r.db.Create(subtask).Error; err != nil {
		return nil, err
	}

	return subtask, nil
}

func (r *TaskRepository) UpdateSubtask(userID, taskID, subtaskID string, completed bool) (*models.Subtask, error) {
	_, err := r.GetTaskByID(taskID, userID)
	if err != nil {
		return nil, err
	}

	var subtask models.Subtask
	if err := r.db.Where("id = ? AND task_id = ?", subtaskID, taskID).First(&subtask).Error; err != nil {
		return nil, errors.New("subtask not found")
	}

	subtask.Completed = completed
	subtask.UpdatedAt = time.Now()
	if err := r.db.Save(&subtask).Error; err != nil {
		return nil, err
	}

	return &subtask, nil
}

func (r *TaskRepository) DeleteSubtask(userID, taskID, subtaskID string) error {
	_, err := r.GetTaskByID(taskID, userID)
	if err != nil {
		return err
	}

	return r.db.Where("id = ? AND task_id = ?", subtaskID, taskID).Delete(&models.Subtask{}).Error
}

func (r *TaskRepository) SaveFileResource(userID, taskID, filename, contentType string, sizeBytes int64, filePath string) (*models.FileResource, error) {
	res := &models.FileResource{
		ID:          "file_" + uuid.New().String()[:8],
		TaskID:      taskID,
		Filename:    filename,
		ContentType: contentType,
		SizeBytes:   sizeBytes,
		FilePath:    filePath,
		CreatedAt:   time.Now(),
	}

	if err := r.db.Create(res).Error; err != nil {
		return nil, err
	}

	return res, nil
}

func (r *TaskRepository) GetFileResourceByID(fileID string) (*models.FileResource, error) {
	var res models.FileResource
	if err := r.db.Where("id = ?", fileID).First(&res).Error; err != nil {
		return nil, errors.New("file attachment not found")
	}
	return &res, nil
}

func (r *TaskRepository) GetAnalytics(userID string) (*models.AnalyticsData, error) {
	var tasks []models.Task
	if err := r.db.Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
		return nil, err
	}

	total := len(tasks)
	completed := 0
	inProgress := 0
	urgent := 0
	lowP := 0
	medP := 0
	highP := 0
	completedThisWeek := 0

	oneWeekAgo := time.Now().Add(-7 * 24 * time.Hour)

	for _, t := range tasks {
		switch t.Status {
		case "completed":
			completed++
			if t.UpdatedAt.After(oneWeekAgo) {
				completedThisWeek++
			}
		case "in_progress":
			inProgress++
		}

		switch t.Priority {
		case "low":
			lowP++
		case "medium":
			medP++
		case "high":
			highP++
		case "urgent":
			urgent++
		}
	}

	rate := 0.0
	if total > 0 {
		rate = math.Round((float64(completed)/float64(total))*10000) / 100
	}

	return &models.AnalyticsData{
		TotalTasks:      total,
		CompletedTasks:  completed,
		InProgressTasks: inProgress,
		UrgentTasks:     urgent,
		CompletionRate:  rate,
		Velocity: models.VelocityData{
			CompletedThisWeek: completedThisWeek,
			Trend:             "up",
		},
		PriorityDistribution: models.PriorityDistribution{
			Low:    lowP,
			Medium: medP,
			High:   highP,
			Urgent: urgent,
		},
	}, nil
}
