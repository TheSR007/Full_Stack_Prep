# Project 09: Multi-Tier Microservices Docker Compose and GitOps CI/CD Stack

## Overview

This project implements a production-grade 10-tier microservices application stack containerized with Docker, orchestrated using Docker Compose, and automated via a GitHub Actions CI/CD pipeline and doco-cd GitOps continuous deployment runner.

It demonstrates containerization best practices, multi-stage builds, path-filtered selective CI testing, container security scanning gates, telemetry monitoring, and zero-downtime GitOps deployments without requiring Kubernetes overhead.

---

## Architecture Overview

![Architecture Diagram](Architechture.gif)

---

## Key Features

1. **Multi-Stage Docker Builds**: Minimal runtime footprints (`alpine`/`slim`), non-root execution (`USER appuser`), layer cache optimization, and container `HEALTHCHECK` directives.
2. **Dual Compose Configuration**:
    - `docker-compose.yml`: Production composition using Docker Hub pre-built images, network isolation, and container CPU/memory resource limits.
    - `docker-compose.dev.yml`: Local development composition supporting source code volume binds, live hot-reloading, and direct debug ports.
3. **Decoupled CI/CD Pipeline (`.github/workflows/ci.yml`)**:
    - Path Filtering: Uses `dorny/paths-filter` to detect modified service directories.
    - Decoupled Service Execution: Independent jobs per microservice (`frontend-nextjs`, `api-gateway`, `api-go-user`, `api-fastapi-worker`). Failures in one service do not block remaining services.
    - Trivy Security Scanning: Container security scan gate prior to Docker Hub image push.
    - BuildKit Parallel Caching: Concurrent image builds using GitHub Actions cache (`type=gha`).
    - Single Docker Hub Repository: Pushes pre-built images to `thesr/fullstack-prep:<service>-<short_sha>` and `:latest`.
4. **GitOps Auto-Sync & Production Orchestration**:
    - Automatic Compose Tag Updates: `update-compose-tags` pins updated 7-character commit SHAs in `docker-compose.yml` only for succeeded builds.
    - Loop Prevention: Commits tag updates back to the repository with `[skip ci]`, preventing recursive workflow triggers.
    - Production Pull Policy: Uses `pull_policy: always` in `docker-compose.yml` to pull pre-built Docker Hub images directly without local build overhead.

---

## Directory Structure

```
09-docker-compose-stack/
├── .github/workflows/ci.yml     # CI/CD Pipeline
├── .env.example                 # Centralized environment variables template
├── docker-compose.yml           # Production Docker Compose specification
├── docker-compose.dev.yml       # Local Development Docker Compose specification
├── .doco-cd.yml                 # GitOps runner configuration
└── docker-compose.doco-cd.yml   # GitOps runner Docker Compose configuration
├── README.md                    # Project documentation (this file)
├── DESIGN_SPEC.md               # Technical design & architecture document
├── Architechture.gravel         # Gravel Graph architectural diagram
├── Architechture.gif            # Architecture Diagram flow
├── nginx/                       # Edge reverse proxy configuration & Dockerfile
│   ├── Dockerfile
│   └── nginx.conf
├── frontend-nextjs/             # Next.js 15 Standalone Frontend App
│   ├── Dockerfile
│   ├── ...
├── api-gateway/                 # Go HTTP API Gateway
│   ├── Dockerfile
│   ├── ...
├── api-go-user/                 # Go User Microservice
│   ├── Dockerfile
│   ├── ...
├── api-fastapi-worker/          # Python FastAPI Worker
│   ├── Dockerfile
│   ├── ...
├── prometheus/                  # Prometheus scraping configuration
│   └── prometheus.yml
└── grafana/                     # Grafana dashboards & datasources provisioning
    ├── dashboards/
    │   └── overview.json
    └── provisioning/
        ├── dashboards/
        └── datasources/
```

---

## Setup & Getting Started Guide

### Prerequisites

Ensure you have the following installed on your machine:

- [Docker Engine](https://docs.docker.com/get-docker/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- Git

### 1. Clone & Environment Setup

Copy the template environment file:

```bash
cd projects/09-docker-compose-stack
cp .env.example .env
```

Review and update configuration values in `.env` if necessary.

---

### 2. Local Development Mode (Hot-Reloading)

To run the stack locally with source code volume mounts and instant live hot-reloading:

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Check status of running development containers:

```bash
docker compose -f docker-compose.dev.yml ps
```

To stop development containers:

```bash
docker compose -f docker-compose.dev.yml down
```

---

### 3. Production Mode Orchestration

To build and run the complete production stack with health checks, resource constraints, network isolation, and telemetry monitoring:

```bash
docker compose up --build -d
```

Verify that all 10 containers are running and healthy:

```bash
docker compose ps
```

To view logs across all services:

```bash
docker compose logs -f
```

To stop the production stack:

```bash
docker compose down
```

---

## Endpoint & Service Reference

When the stack is running, access services at the following URLs:

| Service                  | Protocol / Port | Endpoint URL                  | Description                     |
| ------------------------ | --------------- | ----------------------------- | ------------------------------- |
| **Nginx Edge Proxy**     | HTTP / 80       | http://localhost              | Main entrypoint & proxy routing |
| **Next.js Frontend**     | HTTP / 3000     | http://localhost:3000         | Web UI Dashboard                |
| **Go API Gateway**       | HTTP / 8080     | http://localhost:8080/healthz | Gateway Health Check            |
| **Go User Service**      | HTTP / 8081     | http://localhost:8081/users   | User Microservice Endpoint      |
| **FastAPI Worker**       | HTTP / 8000     | http://localhost:8000/jobs    | Async Worker Jobs Endpoint      |
| **Prometheus Telemetry** | HTTP / 9090     | http://localhost:9090         | Metrics Scraping & Targets      |
| **Grafana Dashboard**    | HTTP / 3001     | http://localhost:3001         | Operational Monitoring UI       |

_Grafana Credentials_: User: `admin`, Password: `adminsecret` (defined in `.env`).

---

## CI/CD Pipeline & GitOps Setup

### GitHub Actions Secrets & Permissions

Configure the following secrets in your GitHub repository (**Settings > Secrets and variables > Actions**):

- `DOCKERHUB_USERNAME`: Your Docker Hub account username.
- `DOCKERHUB_TOKEN`: Personal Access Token generated from Docker Hub.
- `BUMP_TOKEN`: Optional fine-grained GitHub PAT with `Contents: Read and Write` permissions to bypass branch protection rules when committing image tag updates back to the repository (falls back to `GITHUB_TOKEN` if omitted).
- `DOCO_CD_SERVER_URL`: The HTTP Webhook URL of your deployment host server running `doco-cd` (e.g. `https://your-server-ip:8088`).
- `WEBHOOK_SECRET`: Shared secret key matching `WEBHOOK_SECRET` on your `doco-cd` runner server for HMAC SHA-256 payload verification.

---

### Continuous Deployment via doco-cd

`doco-cd` operates as the GitOps runner on the target deployment host server. It deploys pre-built Docker Hub images by executing `docker compose pull && docker compose up -d` upon receiving deployment signals.

#### Deployment Architecture

1. **CI-Driven Webhook Trigger**:
   Upon completing unit tests, container scans, image pushes, and `docker-compose.yml` short-SHA tag updates, GitHub Actions CI sends an authenticated HTTP POST Webhook to `DOCO_CD_SERVER_URL`.
2. **Background Polling Fallback**:
   In addition to real-time CI Webhooks, `doco-cd` maintains a 60-second polling check (`interval: 60`) against the repository as a backup mechanism.

#### 1. Generate GitHub Personal Access Token (PAT)
- Go to GitHub **Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens**.
- Create token with `Contents: Read-only` access for your private repository.
- Export as `GIT_ACCESS_TOKEN` on the deployment host.

#### 2. In-Repository Specification (`.doco-cd.yml`)
- `.doco-cd.yml` defines the target deployment state for the repository (`repository_url: "https://github.com/TheSR007/docker-compose-stack.git"`, `reference: "master"`, `compose_files: ["docker-compose.yml"]`, `env_files: [".env"]`, `remove_orphans: true`, `prune_images: true`).

#### 3. Deploy doco-cd Runner on Host Server
```bash
# make sure these environment secrets are set on the .env 
GIT_ACCESS_TOKEN
WEBHOOK_SECRET

# Launch doco-cd runner container
docker compose -f docker-compose.doco-cd.yml up -d

# Monitor runner logs
docker compose -f docker-compose.doco-cd.yml logs -f
```
