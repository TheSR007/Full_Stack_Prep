# Design Specification: Multi-Tier Microservices Docker Compose and GitOps CI/CD Stack

## Overview

This specification details the architecture, containerization standards, dual-compose environment setup (Dev vs. Prod), CI/CD pipeline automation, and continuous deployment mechanism for an enterprise multi-tier microservices stack.

The stack integrates Next.js, Go microservices, FastAPI, Node.js Express, PostgreSQL, MongoDB, Redis, Nginx reverse proxy, and Prometheus/Grafana monitoring into a unified Docker Compose architecture.

---

## 1. Application & Monitoring Architecture

The architecture comprises 10 interconnected service tiers:

1. **nginx (Reverse Proxy Tier)**: Nginx reverse proxy routing external traffic, handling SSL termination, rate limiting, and path routing to frontend and backend services.
2. **frontend-nextjs (Frontend Tier)**: Next.js App Router application delivering the user interface.
3. **api-gateway (Gateway Tier)**: Go Fiber HTTP API Gateway handling authentication verification, rate limiting, and request routing to backend microservices.
4. **api-go-user (Microservice Tier)**: Go microservice managing user authentication, profiles, and permissions.
5. **api-fastapi-worker (Worker Tier)**: FastAPI Python async worker handling background jobs, file processing, and report generation.
6. **postgres (Relational DB Tier)**: PostgreSQL 16 relational database with persistent volumes, storing users, auth credentials, and structured application state.
7. **mongo (Document DB Tier)**: MongoDB 7 document database for audit logs, unstructured telemetry, and analytics data.
8. **redis (Cache & Queue Tier)**: Redis 7 key-value store for session caching, sliding-window rate limiting, and pub/sub messaging.
9. **prometheus (Monitoring Tier)**: Prometheus server scraping metrics endpoints (`/metrics`) across Go microservices, FastAPI, Node.js, and Nginx.
10. **grafana (Observability Tier)**: Grafana visual dashboard provisioned with pre-configured dashboards for CPU/Memory utilization, HTTP latency, and active service health.

---

## 2. Docker Compose Environment Separation (Dev vs. Prod)

To maintain parity between local development and production while optimizing developer experience, environment configurations are separated into two distinct files:

### Production Compose (`docker-compose.yml`)

- Uses pre-built multi-stage Docker images pulled from Docker Hub (`thesr/fullstack-prep:<service>-${GITHUB_SHA::7}`).
- `restart: unless-stopped` enabled on all containers.
- Isolated custom bridge networks: `frontend-net`, `backend-net`, `db-net`, `monitoring-net`.
- `deploy.resources.limits` setting strict CPU and memory limits per container.
- Secrets loaded exclusively from production `.env` files via `env_file`.
- Services use `depends_on` with `condition: service_healthy`.

### Development Compose (`docker-compose.dev.yml`)

- Builds containers locally using development stages or volume mounts (`./src:/app/src`).
- Enables hot-reloading (`npm run dev`, `go run main.go`, `uvicorn --reload`).
- Exposes direct container debug ports (e.g. Postgres 5432, Redis 6379, Mongo 27017, Go Debugger 4000).
- Mounts local source code directly into containers for instant code reflection without rebuilding.

---

## 3. Dockerfile Multi-Stage Build & Security Best Practices

### Multi-Stage Build Strategy

- **Go Microservices**: `golang:1.22-alpine` builder producing static binaries, copied into empty `scratch` or `alpine:3.19` runner images (final image size < 20MB).
- **Next.js Frontend**: Stage 1 dependency installation, Stage 2 standalone build (`output: 'standalone'`), Stage 3 minimal `node:20-alpine` runner.
- **Python / FastAPI Worker**: Stage 1 wheel builder, Stage 2 minimal `python:3.11-alpine` runner.

### Hardening Standards

- **Non-Root Execution**: Every runtime stage defines `USER appuser` (UID 10001) to eliminate root privileges inside containers.
- **Native Health Checks**: `HEALTHCHECK` instructions baked directly into Dockerfiles.
- **Minimal Surface**: Removal of build tools, compilers, and package managers from runtime images.
- **Ignore Files**: Comprehensive `.dockerignore` files for all services.
- **Graceful Termination**: `STOPSIGNAL SIGTERM` for clean shutdown.

---

## 4. Single Private Docker Hub Repository Strategy

Due to Docker Hub free tier limits:

- **Repository Name**: `thesr/fullstack-prep`
- **Tagging Scheme**:
    - `thesr/fullstack-prep:frontend-nextjs-${GITHUB_SHA::7}`
    - `thesr/fullstack-prep:api-gateway-${GITHUB_SHA::7}`
    - `thesr/fullstack-prep:api-go-user-${GITHUB_SHA::7}`
    - `thesr/fullstack-prep:api-fastapi-worker-${GITHUB_SHA::7}`
- **Floating Tags**: Service-specific latest tags (e.g., `api-gateway-latest`) updated concurrently.

---

## 5. CI Pipeline Architecture (GitHub Actions)

Workflow file: `.github/workflows/ci.yml`

### Pipeline Enforcement Sequence

The pipeline strictly enforces the following stage progression:
**Path Filtering -> Test -> Lint -> Security Scan -> Build -> Push -> Compose Tag Update ([skip ci])**

### 1. Selective Service Change Detection (Path Filtering)

- Uses `dorny/paths-filter@v3` to analyze git diffs for incoming commits or PRs.
- Evaluates changed file paths:
    - `frontend-nextjs`: `projects/09-docker-compose-stack/frontend-nextjs/**`
    - `api-gateway`: `projects/09-docker-compose-stack/api-gateway/**`
    - `api-go-user`: `projects/09-docker-compose-stack/api-go-user/**`
    - `api-fastapi-worker`: `projects/09-docker-compose-stack/api-fastapi-worker/**`
- **Selective Execution**: If a service directory has no modified files, all testing, linting, scanning, building, and pushing steps for that specific service are automatically skipped.

### 2. Parallel Matrix Testing & Linting

- Runs unit test suites concurrently across changed services.
- Code linting: ESLint for Next.js, Golangci-lint for Go services, Flake8/Black for Python, Hadolint for Dockerfiles.

### 3. Container Vulnerability Gate (Trivy)

- Builds local image targets for modified services.
- Scans images using Trivy (`aquasecurity/trivy-action@master`) with parameters:
    - `severity: 'CRITICAL'`
    - `exit-code: '1'`
- **Failure Condition**: If Trivy detects ANY Critical vulnerability in a container image, the pipeline fails immediately and aborts the image push to Docker Hub.

### 4. Parallel BuildKit Building & Docker Hub Pushing

- Utilizes GitHub Actions BuildKit caching (`cache-from: type=gha`, `cache-to: type=gha,mode=max`) for accelerated layer caching.
- Matrix strategy executes build and push jobs concurrently for changed services upon passing test, lint, and security gates.

### 5. Automated Compose Tag Update with `[skip ci]`

- Upon successful build & push, the GitHub Actions bot commits updated image tags to `docker-compose.yml`.
- The commit message includes `[skip ci]` (e.g. `ci: update docker compose image tags [skip ci]`).
- **Loop Prevention**: Including `[skip ci]` prevents GitHub Actions from triggering an infinite recursive CI loop.

---

## 6. Continuous Deployment (Automated doco-cd GitOps Sync)

- **Continuous Monitoring**: `doco-cd` (or a webhook listener) runs continuously on the deployment host, monitoring repository pushes or webhooks.
- **Auto-Sync Trigger**: When `doco-cd` detects a git push (whether a user manual commit to `docker-compose.yml` or a bot commit containing new image tags), it automatically pulls updated images and executes `docker compose pull && docker compose up -d --remove-orphans`.
- **Zero Recurrence**: `doco-cd` applies updates immediately while GitHub Actions CI remains idle due to `[skip ci]`.
