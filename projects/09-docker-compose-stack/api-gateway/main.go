package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	reqCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_gateway_requests_total",
			Help: "Total HTTP requests proxied through API Gateway",
		},
		[]string{"method", "endpoint", "status"},
	)
	reqDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "api_gateway_request_duration_seconds",
			Help:    "Request latency histogram for API Gateway",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"endpoint"},
	)
)

func init() {
	prometheus.MustRegister(reqCounter)
	prometheus.MustRegister(reqDuration)
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func healthzHandler(userServiceURL, workerServiceURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		start := time.Now()
		defer func() {
			reqDuration.WithLabelValues("/healthz").Observe(time.Since(start).Seconds())
		}()

		userStatus := checkServiceHealth(userServiceURL + "/healthz")
		workerStatus := checkServiceHealth(workerServiceURL + "/healthz")

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":             "ok",
			"service":            "api-gateway",
			"api_go_user":        userStatus,
			"api_fastapi_worker": workerStatus,
		})
		reqCounter.WithLabelValues(r.Method, "/healthz", "200").Inc()
	}
}

func checkServiceHealth(urlStr string) string {
	client := http.Client{Timeout: 2 * time.Second}
	resp, err := client.Get(urlStr)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "unreachable"
	}
	_ = resp.Body.Close()
	return "healthy"
}

func newProxyHandler(targetHostStr, targetPath string) http.HandlerFunc {
	targetURL, err := url.Parse(targetHostStr)
	if err != nil {
		log.Fatalf("Invalid target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = targetURL.Host
		req.URL.Path = targetPath
	}

	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		start := time.Now()
		recorder := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}
		proxy.ServeHTTP(recorder, r)

		duration := time.Since(start).Seconds()
		reqDuration.WithLabelValues(r.URL.Path).Observe(duration)
		reqCounter.WithLabelValues(r.Method, r.URL.Path, fmt.Sprintf("%d", recorder.statusCode)).Inc()
	}
}

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *responseRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func main() {
	userServiceHost := os.Getenv("USER_SERVICE_HOST")
	workerServiceHost := os.Getenv("WORKER_SERVICE_HOST")

	http.HandleFunc("/healthz", healthzHandler(userServiceHost, workerServiceHost))
	http.HandleFunc("/api/v1/healthz", healthzHandler(userServiceHost, workerServiceHost))
	http.Handle("/metrics", promhttp.Handler())

	// Proxy routes with path rewriting to downstream endpoints
	http.HandleFunc("/api/v1/users", newProxyHandler(userServiceHost, "/users"))
	http.HandleFunc("/api/v1/jobs", newProxyHandler(workerServiceHost, "/jobs"))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = io.WriteString(w, `{"service":"api-gateway","version":"1.0.0","status":"running"}`)
			return
		}
		http.NotFound(w, r)
	})

	port := os.Getenv("GATEWAY_PORT")
	log.Printf("API Gateway listening on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
