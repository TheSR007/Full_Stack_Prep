package handlers

import (
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"taskflow/api-gateway/middleware"
	"taskflow/shared/utils"
	taskRepo "taskflow/task-service/repository"
	taskServer "taskflow/task-service/server"
)

type TaskHandler struct {
	taskSvc *taskServer.TaskServer
	wsHub   *WebSocketHub
}

func NewTaskHandler(taskSvc *taskServer.TaskServer, wsHub *WebSocketHub) *TaskHandler {
	return &TaskHandler{
		taskSvc: taskSvc,
		wsHub:   wsHub,
	}
}

type CreateTaskDTO struct {
	Title       string   `json:"title" example:"Setup SQLite GORM Migrations"`
	Description string   `json:"description" example:"Configure auto migrations for User and Task models."`
	Status      string   `json:"status" example:"todo"`
	Priority    string   `json:"priority" example:"high"`
	Category    string   `json:"category" example:"Database"`
	Tags        []string `json:"tags" example:"#gorm,#sqlite"`
	DueDate     string   `json:"dueDate" example:"2026-08-05"`
}

type BulkDeleteDTO struct {
	TaskIDs []string `json:"taskIds" example:"t_101,t_102"`
}

type BulkUpdateStatusDTO struct {
	TaskIDs []string `json:"taskIds" example:"t_101,t_102"`
	Status  string   `json:"status" example:"completed"`
}

type CreateSubtaskDTO struct {
	Title string `json:"title" example:"Verify CORS middleware"`
}

type UpdateSubtaskDTO struct {
	Completed bool `json:"completed" example:"true"`
}

type MetaDTO struct {
	Page       int `json:"page" example:"1"`
	Limit      int `json:"limit" example:"50"`
	Total      int `json:"total" example:"42"`
	TotalPages int `json:"totalPages" example:"1"`
}

type PaginatedEnvelopeDTO struct {
	Success bool        `json:"success" example:"true"`
	Data    interface{} `json:"data"`
	Meta    MetaDTO     `json:"meta"`
}

// ListTasks godoc
// @Summary      List Tasks
// @Description  Retrieve paginated tasks with search, category/priority/status filters, and sorting
// @Tags         Tasks
// @Security     Bearer
// @Produce      json
// @Param        search    query string false "Search title or description"
// @Param        status    query string false "Filter status (todo, in_progress, completed, all)"
// @Param        priority  query string false "Filter priority (low, medium, high, urgent, all)"
// @Param        category  query string false "Filter category"
// @Param        tag       query string false "Filter tag"
// @Param        page      query int    false "Page number" default(1)
// @Param        limit     query int    false "Page size limit" default(50)
// @Param        sortBy    query string false "Sort attribute (createdAt, dueDate, priorityWeight, title)"
// @Param        sortOrder query string false "Sort order (asc, desc)"
// @Success      200  {object} PaginatedEnvelopeDTO
// @Router       /tasks [get]
func (h *TaskHandler) ListTasks(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))

	params := taskRepo.TaskFilterParams{
		UserID:    userID,
		Search:    c.Query("search"),
		Status:    c.Query("status"),
		Priority:  c.Query("priority"),
		Category:  c.Query("category"),
		Tag:       c.Query("tag"),
		Page:      page,
		Limit:     limit,
		SortBy:    c.Query("sortBy", "createdAt"),
		SortOrder: c.Query("sortOrder", "desc"),
	}

	tasks, total, err := h.taskSvc.ListTasks(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.PaginatedResponse(tasks, page, limit, total))
}

// GetTaskByID godoc
// @Summary      Get Task by ID
// @Description  Retrieve a single task by its ID
// @Tags         Tasks
// @Security     Bearer
// @Produce      json
// @Param        id   path     string true "Task ID"
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      404  {object} ErrorEnvelopeDTO
// @Router       /tasks/{id} [get]
func (h *TaskHandler) GetTaskByID(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	id := c.Params("id")

	task, err := h.taskSvc.GetTaskByID(id, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			"Task not found",
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(task))
}

// CreateTask godoc
// @Summary      Create Task
// @Description  Create a new task record
// @Tags         Tasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        body body CreateTaskDTO true "Task parameters"
// @Success      201  {object} SingleEnvelopeDTO
// @Failure      400  {object} ErrorEnvelopeDTO
// @Router       /tasks [post]
func (h *TaskHandler) CreateTask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	var dto CreateTaskDTO
	if err := c.BodyParser(&dto); err != nil || dto.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Task title is required",
			[]utils.ErrorDetail{{Field: "title", Message: "Title is required"}},
		))
	}

	task, err := h.taskSvc.CreateTask(userID, dto.Title, dto.Description, dto.Status, dto.Priority, dto.Category, dto.Tags, dto.DueDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			err.Error(),
			nil,
		))
	}

	if h.wsHub != nil {
		h.wsHub.Broadcast(fiber.Map{"event": "task_created", "data": task})
	}

	return c.Status(fiber.StatusCreated).JSON(utils.SuccessResponse(task))
}

// UpdateTask godoc
// @Summary      Update Task
// @Description  Update task attributes by ID
// @Tags         Tasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        id   path     string true "Task ID"
// @Param        body body map[string]interface{} true "Fields to update"
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      404  {object} ErrorEnvelopeDTO
// @Router       /tasks/{id} [put]
func (h *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	id := c.Params("id")

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Invalid JSON update payload",
			nil,
		))
	}

	delete(updates, "id")
	delete(updates, "userId")
	delete(updates, "createdAt")

	task, err := h.taskSvc.UpdateTask(id, userID, updates)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			err.Error(),
			nil,
		))
	}

	if h.wsHub != nil {
		h.wsHub.Broadcast(fiber.Map{"event": "task_updated", "data": task})
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(task))
}

// DeleteTask godoc
// @Summary      Delete Task
// @Description  Delete task by ID
// @Tags         Tasks
// @Security     Bearer
// @Produce      json
// @Param        id   path     string true "Task ID"
// @Success      200  {object} SingleEnvelopeDTO
// @Failure      404  {object} ErrorEnvelopeDTO
// @Router       /tasks/{id} [delete]
func (h *TaskHandler) DeleteTask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	id := c.Params("id")

	if err := h.taskSvc.DeleteTask(id, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			err.Error(),
			nil,
		))
	}

	if h.wsHub != nil {
		h.wsHub.Broadcast(fiber.Map{"event": "task_deleted", "id": id})
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"id":      id,
		"message": "Task deleted successfully",
	}))
}

// BulkDelete godoc
// @Summary      Bulk Delete Tasks
// @Description  Delete multiple tasks at once
// @Tags         Tasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        body body BulkDeleteDTO true "Task IDs array"
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /tasks/bulk-delete [post]
func (h *TaskHandler) BulkDelete(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	var dto BulkDeleteDTO
	if err := c.BodyParser(&dto); err != nil || len(dto.TaskIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"taskIds array is required",
			nil,
		))
	}

	count, err := h.taskSvc.BulkDelete(userID, dto.TaskIDs)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"count":   count,
		"message": strconv.Itoa(count) + " tasks deleted successfully",
	}))
}

// BulkUpdateStatus godoc
// @Summary      Bulk Update Task Status
// @Description  Update status for multiple tasks at once
// @Tags         Tasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        body body BulkUpdateStatusDTO true "Task IDs and new status"
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /tasks/bulk-update-status [patch]
func (h *TaskHandler) BulkUpdateStatus(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	var dto BulkUpdateStatusDTO
	if err := c.BodyParser(&dto); err != nil || len(dto.TaskIDs) == 0 || dto.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"taskIds array and status are required",
			nil,
		))
	}

	count, err := h.taskSvc.BulkUpdateStatus(userID, dto.TaskIDs, dto.Status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"count":   count,
		"message": strconv.Itoa(count) + " tasks updated to " + dto.Status + " status",
	}))
}

// GetCategories godoc
// @Summary      Get Dynamic Categories
// @Description  Retrieve sorted list of active categories
// @Tags         Categories
// @Security     Bearer
// @Produce      json
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /categories [get]
func (h *TaskHandler) GetCategories(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	categories, err := h.taskSvc.GetCategories(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(categories))
}

// CreateSubtask godoc
// @Summary      Create Subtask
// @Description  Create a new subtask under a task
// @Tags         Subtasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        id   path     string true "Task ID"
// @Param        body body CreateSubtaskDTO true "Subtask title"
// @Success      201  {object} SingleEnvelopeDTO
// @Router       /tasks/{id}/subtasks [post]
func (h *TaskHandler) CreateSubtask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	taskID := c.Params("id")

	var dto CreateSubtaskDTO
	if err := c.BodyParser(&dto); err != nil || dto.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Subtask title is required",
			nil,
		))
	}

	subtask, err := h.taskSvc.CreateSubtask(userID, taskID, dto.Title)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusCreated).JSON(utils.SuccessResponse(subtask))
}

// UpdateSubtask godoc
// @Summary      Update Subtask Status
// @Description  Toggle completion state of a subtask
// @Tags         Subtasks
// @Security     Bearer
// @Accept       json
// @Produce      json
// @Param        id        path     string true "Task ID"
// @Param        subtaskId path     string true "Subtask ID"
// @Param        body      body     UpdateSubtaskDTO true "Completed status"
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /tasks/{id}/subtasks/{subtaskId} [patch]
func (h *TaskHandler) UpdateSubtask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	taskID := c.Params("id")
	subtaskID := c.Params("subtaskId")

	var dto UpdateSubtaskDTO
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"Invalid completed boolean status",
			nil,
		))
	}

	subtask, err := h.taskSvc.UpdateSubtask(userID, taskID, subtaskID, dto.Completed)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(subtask))
}

// DeleteSubtask godoc
// @Summary      Delete Subtask
// @Description  Delete subtask by ID
// @Tags         Subtasks
// @Security     Bearer
// @Produce      json
// @Param        id        path     string true "Task ID"
// @Param        subtaskId path     string true "Subtask ID"
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /tasks/{id}/subtasks/{subtaskId} [delete]
func (h *TaskHandler) DeleteSubtask(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	taskID := c.Params("id")
	subtaskID := c.Params("subtaskId")

	if err := h.taskSvc.DeleteSubtask(userID, taskID, subtaskID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(fiber.Map{
		"id":      subtaskID,
		"message": "Subtask deleted",
	}))
}

// GetAnalytics godoc
// @Summary      Get Workload Analytics
// @Description  Calculate workload stats, completion rate, velocity, and priority breakdown
// @Tags         Analytics
// @Security     Bearer
// @Produce      json
// @Success      200  {object} SingleEnvelopeDTO
// @Router       /analytics [get]
func (h *TaskHandler) GetAnalytics(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)

	analytics, err := h.taskSvc.GetAnalytics(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusOK).JSON(utils.SuccessResponse(analytics))
}

// UploadFile godoc
// @Summary      Upload File Attachment
// @Description  Upload file resource for a task
// @Tags         Files
// @Security     Bearer
// @Accept       multipart/form-data
// @Produce      json
// @Param        file   formData file   true  "File to upload"
// @Param        taskId formData string false "Task ID association"
// @Success      201  {object} SingleEnvelopeDTO
// @Router       /files/upload [post]
func (h *TaskHandler) UploadFile(c *fiber.Ctx) error {
	userID, _ := c.Locals(middleware.UserContextKey).(string)
	taskID := c.FormValue("taskId")

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.BuildErrorResponse(
			utils.ErrValidationError,
			"No file uploaded",
			nil,
		))
	}

	savePath := filepath.Join(".", "uploads", uuid.New().String()+"_"+file.Filename)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			"Failed to save uploaded file",
			nil,
		))
	}

	res, err := h.taskSvc.SaveFileResource(userID, taskID, file.Filename, file.Header.Get("Content-Type"), file.Size, savePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.BuildErrorResponse(
			utils.ErrInternalServerError,
			err.Error(),
			nil,
		))
	}

	return c.Status(fiber.StatusCreated).JSON(utils.SuccessResponse(res))
}

// DownloadFile godoc
// @Summary      Download File Attachment
// @Description  Stream download file by ID
// @Tags         Files
// @Security     Bearer
// @Param        id path string true "File Resource ID"
// @Success      200 {file} file
// @Router       /files/download/{id} [get]
func (h *TaskHandler) DownloadFile(c *fiber.Ctx) error {
	fileID := c.Params("id")
	res, err := h.taskSvc.GetFileResourceByID(fileID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(utils.BuildErrorResponse(
			utils.ErrNotFound,
			"File not found",
			nil,
		))
	}

	return c.Download(res.FilePath, res.Filename)
}