# Docker, Dockerfile & Docker Compose Cheatsheet

A production-grade reference guide for Docker multi-stage builds (`development` vs `production` targets), container optimization, security hardening, and Docker Compose local development vs production orchestration.

---

## 1. Dockerfile Best Practices & Multi-Stage Target Architecture

### Key Principles

1. **Multi-Stage Build Targets**: Define distinct `AS development` targets (with hot-reloading & dev dependencies) and `AS production` targets (optimized minimal runtimes with non-root user).
2. **Minimal Base Images**: Use `alpine` or `slim` variants to minimize container attack surface and image size.
3. **Layer Optimization**: Copy dependency descriptors (`package.json`, `go.mod`, `requirements.txt`) first and run dependency installation before copying application source code.
4. **Non-Root Execution**: Create a dedicated system user/group (`USER appuser` / `USER nextjs`) to prevent privileged root execution in production.
5. **Explicit Healthchecks**: Include `HEALTHCHECK` directives for container status verification.

---

### Language Specific Dockerfile Blueprints

#### Next.js Standalone (Node.js)

```dockerfile
# Stage 1: Base image
FROM node:24-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# Stage 3: Development target (Runs next dev with live hot reloading)
FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 4: Production Builder
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public && npm run build

# Stage 5: Production Runner target (Runs production standalone server)
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 10001 nodejs && \
    adduser --system --uid 10001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

STOPSIGNAL SIGTERM

CMD ["node", "server.js"]
```

#### Go Microservice (Go Fiber)

```dockerfile
# Stage 1: Base image
FROM golang:1.25-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY go.mod go.sum* ./
RUN mkdir -p /go/pkg && (go mod download || true)

# Stage 3: Development target (Runs go run with live reloading)
FROM base AS development
COPY --from=deps /go/pkg /go/pkg
COPY . .
EXPOSE 8080
CMD ["go", "run", "main.go"]

# Stage 4: Production Builder
FROM base AS builder
COPY --from=deps /go/pkg /go/pkg
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api-gateway .

# Stage 5: Production Runner target (Runs compiled static binary)
FROM alpine:3.19 AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/api-gateway .
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

STOPSIGNAL SIGTERM

CMD ["./api-gateway"]
```

#### Python FastAPI Worker

```dockerfile
# Stage 1: Base image
FROM python:3.11-alpine AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# Stage 2: Development target (Runs uvicorn with --reload)
FROM base AS development
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Stage 3: Production Builder
FROM base AS builder
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt && pip install --no-cache-dir --user gunicorn "uvicorn[standard]"

# Stage 4: Production Runner target (Runs multi-worker Gunicorn server)
FROM base AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /root/.local /home/appuser/.local
COPY . .

ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz')" || exit 1

STOPSIGNAL SIGTERM

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "-b", "0.0.0.0:8000", "--workers", "4"]
```

---

## 2. Docker Compose: Production vs Local Development

### Comparison Matrix

| Feature | Local Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
|---|---|---|
| **Build Target** | `target: development` | `target: production` (or pre-built image) |
| **Image Source** | `build: ./<service>` (local Dockerfile) | Pre-built Docker Hub static images |
| **Pull Policy** | Default (`build` or `if_not_present`) | `pull_policy: always` |
| **Code Mounting** | Read-Only Host Bind Mounts (`./src:/app/src:ro`) | None (Baked into immutable container layers) |
| **Hot-Reloading** | Enabled (`WATCHPACK_POLLING: "true"`, `uvicorn --reload`, `go run`) | Disabled (`node server.js`, compiled binary, Gunicorn) |
| **Resource Limits** | Unrestricted | Explicit CPU & Memory caps (`limits: cpus: '0.5', memory: 256M`) |
| **Network Security**| Host exposed debug ports | Isolated internal bridge networks (`frontend-net`, `backend-net`, `db-net`) |

---

### Production Compose Spec (`docker-compose.yml`)

```yaml
networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge

services:
  frontend-nextjs:
    image: thesr/fullstack-prep:frontend-nextjs-0701bb6
    pull_policy: always
    container_name: devops-frontend-nextjs
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      HOSTNAME: "0.0.0.0"
    networks:
      - frontend-net
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:3000/"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

---

### Local Development Spec (`docker-compose.dev.yml`)

```yaml
services:
  frontend-nextjs:
    build:
      context: ./frontend-nextjs
      dockerfile: Dockerfile
      target: development
    container_name: devops-frontend-dev
    volumes:
      - ./frontend-nextjs:/app
      - /app/node_modules
      - /app/.next
    environment:
      NODE_ENV: development
      WATCHPACK_POLLING: "true"
    ports:
      - "3000:3000"

  api-fastapi-worker:
    build:
      context: ./api-fastapi-worker
      dockerfile: Dockerfile
      target: development
    container_name: devops-api-fastapi-worker-dev
    volumes:
      - ./api-fastapi-worker:/app
    ports:
      - "8000:8000"
```

---

## 3. Essential Docker CLI Reference Commands

### Image Operations

```bash
# Build an image targeting development stage
docker build --target development -t myapp:dev .

# Build an image targeting production stage
docker build --target production -t myrepo/myapp:v1.0.0 .

# Tag an image for Docker Hub
docker tag myapp:v1.0.0 myrepo/myapp:latest

# Push image to registry
docker push myrepo/myapp:v1.0.0

# Prune unused images and build cache
docker image prune -a
docker builder prune -a
```

### Container Operations

```bash
# Run container in background with port forwarding
docker run -d -p 8080:8080 --name my-app myrepo/myapp:latest

# Execute interactive shell inside running container
docker exec -it devops-frontend-nextjs /bin/sh

# View container logs continuously
docker logs -f --tail 100 devops-api-gateway

# Inspect health check status
docker inspect --format='{{json .State.Health}}' devops-frontend-nextjs | jq
```

### Docker Compose Commands

```bash
# Start production stack using pre-built images
docker compose up -d

# Start development stack targeting development stages with hot-reloading
docker compose -f docker-compose.dev.yml up --build

# Stop and remove containers, networks, and volumes
docker compose down -v

# View container health and status
docker compose ps
```
