# GitHub Actions CI/CD Pipeline Documentation

This directory contains the GitHub Actions CI/CD workflow configuration for the Multi-Tier Microservices Monorepo.

## Workflow File

- File: `ci.yml`
- Workflow Name: Multi-Tier Microservices CI/CD Pipeline

## Trigger Conditions

The pipeline is triggered automatically under the following conditions:
1. Direct push to `master` or `main` branches.
2. Merged pull requests targeting `master` or `main` branches.

## Architecture and Flow

The workflow is decoupled into independent service pipelines to ensure that a failure in one service does not block testing, building, or deployment of other services.

```
+-------------------------------------------------------------------+
|                        1. Filter Stage                            |
|             (Detects modified files per service)                  |
+-------------------------------------------------------------------+
       |                  |                   |                  |
       v                  v                   v                  v
+--------------+   +--------------+   +--------------+   +--------------+
|   Frontend   |   | API Gateway  |   | Go User Svc  |   |Worker Service|
|  Pipeline    |   |  Pipeline    |   |  Pipeline    |   |  Pipeline    |
+--------------+   +--------------+   +--------------+   +--------------+
| - Unit Test  |   | - Unit Test  |   | - Unit Test  |   | - Unit Test  |
| - Lint       |   | - Lint       |   | - Lint       |   | - Lint       |
| - Build Image|   | - Build Image|   | - Build Image|   | - Build Image|
| - Security   |   | - Security   |   | - Security   |   | - Security   |
|   Scan       |   |   Scan       |   |   Scan       |   |   Scan       |
| - Push Hub   |   | - Push Hub   |   | - Push Hub   |   | - Push Hub   |
+--------------+   +--------------+   +--------------+   +--------------+
       
       |                  |                   |                  |
       v                  v                   v                  v
+-------------------------------------------------------------------+
|                  2. Tag Update Stage                              |
|   (Bumps docker-compose.yml tags for successful builds & pushes)  |
+-------------------------------------------------------------------+
```

---

## Detailed Pipeline Stages

### 1. Change Detection (`filter` job)

- Tool: `dorny/paths-filter`
- Analyzes committed file paths to determine which microservices require rebuilds.
- Outputs boolean flags (`frontend`, `api-gateway`, `api-go-user`, `api-fastapi-worker`).

---

### 2. Microservice Execution Pipelines

Each microservice runs in an isolated, parallel job when its change flag is `true`.

#### Frontend Service (`frontend-nextjs`)
- Runtime: Node.js 22
- Tests: `npm test`
- Linting: `npm run lint`
- Docker Build: Multi-stage target `production`
- Security Scan: Trivy (Non-blocking)
- Image Push: `${DOCKERHUB_USERNAME}/fullstack-prep:frontend-nextjs-<short_sha>` and `:latest`

#### API Gateway Service (`api-gateway`)
- Runtime: Go 1.25
- Tests: `go test -v ./...`
- Linting: `go vet ./...`
- Docker Build: Multi-stage target `production`
- Security Scan: Trivy (Critical Gate, blocks on CVEs)
- Image Push: `${DOCKERHUB_USERNAME}/fullstack-prep:api-gateway-<short_sha>` and `:latest`

#### Go User Service (`api-go-user`)
- Runtime: Go 1.25
- Tests: `go test -v ./...`
- Linting: `go vet ./...`
- Docker Build: Multi-stage target `production`
- Security Scan: Trivy (Critical Gate, blocks on CVEs)
- Image Push: `${DOCKERHUB_USERNAME}/fullstack-prep:api-go-user-<short_sha>` and `:latest`

#### FastAPI Worker Service (`api-fastapi-worker`)
- Runtime: Python 3.11
- Tests: `pytest`
- Linting: `flake8`
- Docker Build: Multi-stage target `production`
- Security Scan: Trivy (Critical Gate, blocks on CVEs)
- Image Push: `${DOCKERHUB_USERNAME}/fullstack-prep:api-fastapi-worker-<short_sha>` and `:latest`

---

### 3. GitOps Compose Tag Update (`update-compose-tags` job)

- Runs after all service pipelines complete.
- Condition: Executes if at least one service pipeline succeeds.
- Action:
  1. Computes the 7-character commit SHA (`SHORT_SHA`).
  2. Updates `docker-compose.yml` image tags **only for services that built and pushed successfully**.
  3. Commits and pushes the modified `docker-compose.yml` back to `master`/`main` using `[skip ci]` to prevent infinite workflow loops.

---

## Secrets Configuration

The following GitHub Repository Secrets are required:

| Secret Name | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Username for Docker Hub authentication |
| `DOCKERHUB_TOKEN` | Access Token or Password for Docker Hub authentication |
| `BUMP_TOKEN` | Optional Personal Access Token (PAT) with `contents: write` permission to bypass branch protection rules when committing compose tag updates. Defaults to `GITHUB_TOKEN` if omitted. |
