package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"

	"taskflow/api-gateway/handlers"
	"taskflow/api-gateway/metrics"
	"taskflow/api-gateway/middleware"
	"taskflow/api-gateway/swagger"

	taskRepo "taskflow/task-service/repository"
	taskServer "taskflow/task-service/server"
	userRepo "taskflow/user-service/repository"
	userServer "taskflow/user-service/server"
)

// @title           TaskFlow Suite — Go Microservices API
// @version         1.0.0
// @description     High-performance Go Microservices API built with Go Fiber, gRPC, and SQLite3.
// @termsOfService  http://swagger.io/terms/

// @contact.name    TaskFlow Dev Support
// @contact.email   dev@taskflow.dev

// @host            localhost:5000
// @BasePath        /api/v1

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	// Initialize User Service
	uRepo, err := userRepo.NewUserRepository("user_service.db")
	if err != nil {
		log.Fatalf("Failed to init user repo: %v", err)
	}
	uSvc := userServer.NewUserServer(uRepo)

	// Initialize Task Service
	tRepo, err := taskRepo.NewTaskRepository("task_service.db")
	if err != nil {
		log.Fatalf("Failed to init task repo: %v", err)
	}
	tSvc := taskServer.NewTaskServer(tRepo)

	// Initialize WebSocket Hub
	wsHub := handlers.NewWebSocketHub()

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
	})

	// Global Middleware & Prometheus Metrics Instrumentation
	app.Use(logger.New())
	app.Use(metrics.PrometheusMiddleware())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:5173, http://localhost:8000, http://localhost:5174",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Health Checks & Telemetry Metrics
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "ok", "service": "api-gateway"})
	})

	app.Get("/readyz", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "ready", "service": "api-gateway"})
	})

	// Register Prometheus /metrics Endpoint
	metrics.RegisterMetrics(app)

	// Register Swagger UI
	swagger.RegisterSwagger(app)

	// Register Handlers
	authH := handlers.NewAuthHandler(uSvc)
	taskH := handlers.NewTaskHandler(tSvc, wsHub)

	// API v1 Router Group
	api := app.Group("/api/v1")

	// Auth Endpoints
	auth := api.Group("/auth")
	auth.Post("/register", authH.Register)
	auth.Post("/login", authH.Login)
	auth.Post("/refresh", authH.Refresh)
	auth.Post("/logout", middleware.AuthRequired(), authH.Logout)
	auth.Get("/me", middleware.AuthRequired(), authH.Me)

	// Task & Subtask Endpoints
	tasks := api.Group("/tasks", middleware.AuthRequired())
	tasks.Get("/", taskH.ListTasks)
	tasks.Post("/", taskH.CreateTask)
	tasks.Post("/bulk-delete", taskH.BulkDelete)
	tasks.Patch("/bulk-update-status", taskH.BulkUpdateStatus)
	tasks.Get("/:id", taskH.GetTaskByID)
	tasks.Put("/:id", taskH.UpdateTask)
	tasks.Patch("/:id", taskH.UpdateTask)
	tasks.Delete("/:id", taskH.DeleteTask)

	tasks.Post("/:id/subtasks", taskH.CreateSubtask)
	tasks.Patch("/:id/subtasks/:subtaskId", taskH.UpdateSubtask)
	tasks.Delete("/:id/subtasks/:subtaskId", taskH.DeleteSubtask)

	// Categories Endpoint
	api.Get("/categories", middleware.AuthRequired(), taskH.GetCategories)

	// Analytics Endpoint
	api.Get("/analytics", middleware.AuthRequired(), taskH.GetAnalytics)

	// File Upload & Download Endpoints
	files := api.Group("/files", middleware.AuthRequired())
	files.Post("/upload", taskH.UploadFile)
	files.Get("/download/:id", taskH.DownloadFile)

	// WebSocket Endpoint
	api.Get("/ws/tasks", websocket.New(func(c *websocket.Conn) {
		wsHub.HandleWS(c)
	}))

	log.Println("Go Fiber API Gateway listening on http://localhost:5000")
	log.Fatal(app.Listen(":5000"))
}