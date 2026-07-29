package main

import (
	"fmt"
	"log"

	"taskflow/user-service/repository"
	"taskflow/user-service/server"
)

func main() {
	repo, err := repository.NewUserRepository("user_service.db")
	if err != nil {
		log.Fatalf("Failed to initialize user database: %v", err)
	}

	userSvc := server.NewUserServer(repo)
	_ = userSvc

	fmt.Println("User Service initialized with SQLite storage")
}