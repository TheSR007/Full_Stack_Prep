package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthzHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/healthz", nil)
	w := httptest.NewRecorder()

	healthzHandler(w, req)

	res := w.Result()
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK, got %v", res.Status)
	}

	var body map[string]string
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		t.Fatalf("Failed to parse JSON body: %v", err)
	}

	if body["service"] != "api-go-user" {
		t.Errorf("Expected service 'api-go-user', got '%s'", body["service"])
	}
}

func TestUsersHandlerGet(t *testing.T) {
	req := httptest.NewRequest("GET", "/users", nil)
	w := httptest.NewRecorder()

	usersHandler(w, req)

	res := w.Result()
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %v", res.Status)
	}

	var users []User
	if err := json.NewDecoder(res.Body).Decode(&users); err != nil {
		t.Fatalf("Failed to parse users list: %v", err)
	}

	if len(users) == 0 {
		t.Errorf("Expected non-empty users list")
	}
}

func TestUsersHandlerPostValidation(t *testing.T) {
	payload := `{"username": ""}`
	req := httptest.NewRequest("POST", "/users", strings.NewReader(payload))
	w := httptest.NewRecorder()

	usersHandler(w, req)

	res := w.Result()
	defer res.Body.Close()

	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for empty username/email, got %v", res.Status)
	}
}