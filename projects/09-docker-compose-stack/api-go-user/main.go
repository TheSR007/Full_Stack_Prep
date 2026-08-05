package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

var (
	db          *sql.DB
	rdb         *redis.Client
	ctx         = context.Background()
	reqCounter  = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "user_service_requests_total",
			Help: "Total HTTP requests handled by user service",
		},
		[]string{"method", "endpoint", "status"},
	)
	usersGauge = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "user_service_registered_users",
			Help: "Current total registered users in database",
		},
	)
)

func init() {
	prometheus.MustRegister(reqCounter)
	prometheus.MustRegister(usersGauge)
}

func initDB() {
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Printf("Warning: Database connection failed init: %v", err)
		return
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(100) NOT NULL,
		role VARCHAR(20) DEFAULT 'USER',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	if _, err := db.Exec(createTableSQL); err != nil {
		log.Printf("Warning: Table migration failed: %v", err)
	} else {
		// Seed default user if empty
		var count int
		_ = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
		if count == 0 {
			_, _ = db.Exec("INSERT INTO users (username, email, role) VALUES ('admin', 'admin@example.com', 'ADMIN'), ('devuser', 'dev@example.com', 'USER')")
		}
		usersGauge.Set(float64(count))
	}
}

func initRedis() {
	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")

	rdb = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	})
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	reqCounter.WithLabelValues(r.Method, "/healthz", "200").Inc()
	status := map[string]string{
		"status":   "ok",
		"service":  "api-go-user",
		"database": "disconnected",
		"redis":    "disconnected",
	}

	if db != nil && db.Ping() == nil {
		status["database"] = "connected"
	}
	if rdb != nil && rdb.Ping(ctx).Err() == nil {
		status["redis"] = "connected"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(status)
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		// Try Redis cache first
		if rdb != nil {
			cached, err := rdb.Get(ctx, "users:list").Result()
			if err == nil && cached != "" {
				reqCounter.WithLabelValues("GET", "/users", "200_cache").Inc()
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(cached))
				return
			}
		}

		users := []User{}
		if db != nil && db.Ping() == nil {
			rows, err := db.Query("SELECT id, username, email, role, created_at FROM users ORDER BY id ASC")
			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var u User
					if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.CreatedAt); err == nil {
						users = append(users, u)
					}
				}
			}
		}

		if len(users) == 0 {
			users = append(users, User{
				ID:        1,
				Username:  "admin",
				Email:     "admin@example.com",
				Role:      "ADMIN",
				CreatedAt: time.Now(),
			})
		}

		data, _ := json.Marshal(users)
		if rdb != nil {
			_ = rdb.Set(ctx, "users:list", string(data), 30*time.Second).Err()
		}

		reqCounter.WithLabelValues("GET", "/users", "200").Inc()
		usersGauge.Set(float64(len(users)))
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(data)
		return
	}

	if r.Method == http.MethodPost {
		var u User
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			reqCounter.WithLabelValues("POST", "/users", "400").Inc()
			http.Error(w, `{"error": "Invalid payload"}`, http.StatusBadRequest)
			return
		}

		if u.Username == "" || u.Email == "" {
			reqCounter.WithLabelValues("POST", "/users", "400").Inc()
			http.Error(w, `{"error": "Username and email are required"}`, http.StatusBadRequest)
			return
		}

		if u.Role == "" {
			u.Role = "USER"
		}

		if db != nil && db.Ping() == nil {
			err := db.QueryRow("INSERT INTO users (username, email, role) VALUES ($1, $2, $3) RETURNING id, created_at", u.Username, u.Email, u.Role).Scan(&u.ID, &u.CreatedAt)
			if err != nil {
				log.Printf("Failed to insert user: %v", err)
			}
		} else {
			u.ID = int(time.Now().Unix())
			u.CreatedAt = time.Now()
		}

		if rdb != nil {
			_ = rdb.Del(ctx, "users:list").Err()
		}

		reqCounter.WithLabelValues("POST", "/users", "201").Inc()
		usersGauge.Inc()
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(u)
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

func main() {
	initDB()
	initRedis()

	http.HandleFunc("/healthz", healthzHandler)
	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/users", usersHandler)

	port := os.Getenv("USER_SERVICE_PORT")
	log.Printf("User Microservice listening on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}