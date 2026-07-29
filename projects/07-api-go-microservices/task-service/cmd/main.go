package main

import (
	"fmt"
	"log"

	"taskflow/task-service/repository"
	"taskflow/task-service/server"
)

func main() {
	repo, err := repository.NewTaskRepository("task_service.db")
	if err != nil {
		log.Fatalf("Failed to initialize task database: %v", err)
	}

	taskSvc := server.NewTaskServer(repo)
	_ = taskSvc

	fmt.Println("Task Service initialized with SQLite storage")
}