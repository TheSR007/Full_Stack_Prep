# Full Stack Prep — Multistack Engineering & DevOps Roadmap

> **Goal:** Master modern full-stack development, microservices architecture, database optimization, containerization, CI/CD pipelines, and AWS cloud deployment through 13 hands-on test projects.

---

## Tech Stack Overview & Completion Status

| Layer         | Technologies                                                  | Status             | Test Projects                                                             |
| :------------ | :------------------------------------------------------------ | :----------------- | :------------------------------------------------------------------------ |
| **Frontend**  | React 19, Next.js 16, HTMX 2.0, Svelte 5 / SvelteKit          | ✅ Completed (4/4) | Task Manager UI Quartet (`01-react`, `02-nextjs`, `03-htmx`, `04-svelte`) |
| **Backend**   | Node.js (Express), FastAPI (Async Python), Go (Microservices) | ✅ Completed (3/3) | Task Manager API (`05-api-nodejs`, `06-api-fastapi` , `07-api-go`)        |
| **Database**  | SQLite3, PostgreSQL, MongoDB, Redis                           | ✅ Completed       | Multi-DB Task Store (`08-database-lab`)                                   |
| **DevOps**    | Docker, Docker Compose, GitHub Actions, doco-cd               | ✅ Completed       | Docker Stack & GitOps CI/CD (`09-docker-compose-stack`, `ci.yml`)         |
| **K8s**       | Kubernetes, Helm, ArgoCD                                      | In Future (0/1)    | Kubernetes Production Manifests (`10-k8s-manifests`)                      |
| **AWS Cloud** | VPC, EC2, ALB, RDS, S3, Route53, Terraform                    | Not Started (0/1)  | Infrastructure as Code (`12-aws-terraform`)                               |
| **Capstone**  | Next.js, Go Microservices, Multi-DB, Docker, K8s, AWS         | Not Started (0/1)  | DevDash Capstone Dashboard (`13-devdash-capstone`)                        |

---

## 1-Week Sprint Roadmap & Project Trackers

### Phase 1: Foundation (Day 1-2)

#### Day 1: Frontend Quartet

- [x] **[Project 01: Task Manager (React 19 SPA)](./projects/01-task-manager-react)**
    - **Tech:** React 19, Vite 8, React Router v7, Zustand 5, TanStack Query v5, Tailwind CSS v4, `@hello-pangea/dnd`, Lucide Icons
    - **Features:** Glassmorphism UI, interactive Kanban Board with Drag-and-Drop, Data Table view, dynamic category discovery, Analytics dashboard, theme persistence.
- [x] **[Project 02: Task Manager (Next.js 16 App Router)](./projects/02-task-manager-nextjs)**
    - **Tech:** Next.js 16, React 19, TypeScript, Server Actions (`"use server"`), Route Handlers, Edge Proxy Middleware, Tailwind CSS v4
    - **Features:** Server-side rendering, streaming loading (`loading.tsx`), dynamic metadata, bulk batch operations, multi-field search, keyboard hotkeys engine (`N`, `/`, `B`, `L`, `?`, `Esc`).
- [x] **[Project 03: Task Manager (HTMX 2.0 + FastAPI)](./projects/03-task-manager-htmx)**
    - **Tech:** HTMX 2.0, FastAPI (Python), Jinja2 templates, SortableJS, Lucide Icons, Tailwind CSS
    - **Features:** Server-rendered SPA feel, `hx-get`/`hx-post`/`hx-put`/`hx-delete` target swapping, Out-Of-Band (OOB) Jinja2 toasts, active search filtering.
- [x] **[Project 04: Task Manager (SvelteKit + Svelte 5)](./projects/04-task-manager-svelte)**
    - **Tech:** Svelte 5 (Runes `$state`, `$derived`, `$effect`), SvelteKit, TypeScript, Form Actions (`use:enhance`), REST API endpoints (`+server.ts`), View Transitions API (`onNavigate`), `svelte-dnd-action`
    - **Features:** Svelte 5 Runes store, progressive enhancement, custom error boundary (`+error.svelte`), server handle hook (`hooks.server.ts`).

#### Day 2: Backend Trio

- [x] **[Project 05: Task Manager API (Node.js / Express)](./projects/05-api-nodejs)**
    - **Tech:** Express 5, TypeScript 5, Prisma 6 ORM, Zod 3, JWT (Bearer + HttpOnly Cookies), Winston, Morgan, Swagger UI, Jest, Supertest
    - **Features:** User Auth (JWT + HttpOnly cookies), Task CRUD, subtask checklist, activity log tracking, bulk actions, dynamic category discovery, analytics metrics engine, rate limiting, OpenAPI Swagger UI (/api-docs), 100% passing Jest test suite.
- [x] **[Project 06: Task Manager API (FastAPI Async)](./projects/06-api-fastapi)**
    - **Tech:** FastAPI, Python async, Pydantic v2, SQLAlchemy 2.0 Async, Alembic, JWT (Bearer + HttpOnly Cookies), WebSockets, BackgroundTasks, Prometheus, Pytest, Uvicorn
    - **Features:** User Auth (JWT + HttpOnly cookies), Task CRUD, subtask checklist, activity log tracking, bulk actions, dynamic category discovery, file attachment upload/download, WebSockets (`/api/v1/ws/tasks`), Prometheus metrics (`/metrics`), OpenAPI Swagger UI (/api-docs), 100% passing Pytest test suite.
- [x] **[Project 07: Task Manager API (Go Microservices)](./projects/07-api-go-microservices)**
    - **Tech:** Go 1.22, Go Fiber v2, gRPC, Protobuf, GORM SQLite3 (PostgreSQL Ready), JWT (Bearer + HttpOnly Cookies), WebSockets, Prometheus, Swag Swagger UI, Go Testing
    - **Features:** User Auth (JWT + HttpOnly cookies), Task CRUD, subtask checklist, activity log tracking, bulk actions, dynamic category discovery, file attachment upload/download, WebSockets (`/api/v1/ws/tasks`), Prometheus metrics (`/metrics`), Swag OpenAPI Swagger UI (`/api-docs/`), 100% passing Go test suite (`go test ./...`).

---

### Phase 2: Data Layer (Day 3)

- [x] **[Project 08: Database Lab & Storage Benchmarking](./projects/08-database-lab/)**
    - **Tech:** SQLite3 (`sqlite3`), PostgreSQL (`pg` Pool), MongoDB (`mongodb`), Redis (`ioredis`), Prisma 6 ORM, Mongoose ODM, TypeScript
    - **Scope:** Raw Drivers vs ORM/ODM comparison, PRAGMA WAL mode, PostgreSQL GIN JSONB index + Full-Text Search (`tsvector`) + CTEs, MongoDB Aggregation Pipelines + Embedded Subtasks (`$push`), Redis Pipelining + Cache-Aside + Sliding Window Rate Limiting (ZSET) + Session TTL + Pub/Sub, multi-schema Prisma setup (`postgresql` & `sqlite`), single ASCII 100k/1M benchmarking suite (`npm run bench`, `npm run bench:1m`).

---

### Phase 3: Containerization & CI/CD Pipeline (Day 4)

- [x] **[Project 09: Multi-Service Docker Compose Stack & GitOps CI/CD Pipeline](./projects/09-docker-compose-stack)**
    - **Tech:** Docker, Docker Compose, Nginx, Next.js, Go Fiber, FastAPI, PostgreSQL, MongoDB, Redis, Prometheus, Grafana, GitHub Actions, doco-cd
    - **Features:** Production 10-tier microservices orchestration, dual compose setup (`docker-compose.yml` prod with `pull_policy: always` vs `docker-compose.dev.yml` dev hot-reload), decoupled path-filtered parallel CI workflow, Trivy security gates, BuildKit parallel caching, single Docker Hub repository (`fullstack-prep`), 7-character short SHA tags, bot `[skip ci]` tag updates, `doco-cd` GitOps auto-sync, `Architechture.gif`, and workflow documentation.

![Architecture Diagram](./projects/09-docker-compose-stack/Architechture.gif)

---

### Phase 4: Kubernetes Orchestration (Day 5 - In Future)

- [ ] **[Project 10: Kubernetes Production Manifests](./projects/10-k8s-manifests)**
    - **Tech:** K8s Deployments, Services, ConfigMaps, Secrets, Ingress TLS, HPA, Helm, ArgoCD
    - **Features:** Production Kubernetes manifests, HPA autoscaling, ingress controller, Helm charts, ArgoCD GitOps deployment.

---

### Phase 5: Cloud Infrastructure (Day 6)

- [ ] **Project 12: AWS Infrastructure as Code (Terraform)** — `projects/12-aws-terraform/`
    - **Tech:** Terraform, AWS VPC (3-tier), EC2 ASG, RDS PostgreSQL, ALB, S3, CloudFront, Route53

---

### Phase 6: Capstone Integration (Day 7)

- [ ] **Project 13: DevDash Developer Productivity Dashboard** — `projects/13-devdash-capstone/`
    - **Tech:** Next.js 16, Go API Gateway, Node.js + FastAPI microservices, PostgreSQL + Redis + MongoDB, K8s, AWS deployment

---

## Frontend Design System & UI/UX Standards

All frontend implementations (React, Next.js, HTMX, SvelteKit) strictly follow **[DESIGN.md](./projects/DESIGN.md)** (`ui-ux-pro-max` standards):

- **Glassmorphism**: `.glass-panel` backdrop-blur (`12px`), rounded containers (`rounded-2xl`).
- **Color Palettes**: Slate background tokens (`slate-50` light / `#070a13` dark mode), Indigo/Violet interactive gradients, semantic priority badges (Emerald Low, Sky Medium, Amber High, Rose Urgent).
- **Dynamic Category Extraction**: Deduplicated case-insensitive category discovery with alphabetical sorting.
- **Iconography**: 100% Lucide vector icons (no structural emojis).

---

## Backend API Standards & Specification

All backend implementations (Node.js, FastAPI, Go Microservices) strictly follow **[API_DOCS.md](./projects/API_DOCS.md)**:

- **Base Endpoint Architecture**: Standardized `/api/v1` RESTful JSON route hierarchy.
- **Interactive OpenAPI/Swagger**: Live Swagger UI documentation hosted at `/api-docs`.
- **Response Envelope**: Standardized `{ success: true, data, meta }` wrapper for data and `{ success: false, error: { code, message, details } }` for errors.
- **Dual-Token Authentication**: Short-lived JWT Access Tokens (`Authorization: Bearer <token>`, 15m) + Long-lived Refresh Tokens stored in database & delivered via secure HttpOnly cookie (`refreshToken`, 7d).
- **Role-Based Access Control**: Granular `USER` and `ADMIN` role access guards.
- **Standardized Error Handling**: Unified error codes (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_SERVER_ERROR`).
- **Data Parity**: Standardized CRUD schemas for Tasks, Subtasks, Activity History, Dynamic Categories, and Analytics metrics across all backend implementations.

---

## Cheatsheets & Reference Guides

Comprehensive reference guides created during hands-on practice:

- [Global Backend REST API Specification (API_DOCS.md)](./projects/API_DOCS.md)
- [Global UI/UX Design System (DESIGN.md)](./projects/DESIGN.md)
- [FastAPI & SQLAlchemy 2.0 Async Cheatsheet](./cheatsheets/fastapi.md)
- [Node.js & Express REST API Cheatsheet](./cheatsheets/nodejs.md)
- [SvelteKit & Svelte 5 Cheatsheet](./cheatsheets/sveltkit.md)
- [React & Vite Setup Cheatsheet](./cheatsheets/react.md)
- [Next.js App Router Cheatsheet](./cheatsheets/nextjs.md)

---

## Daily Progress Summary

| Day     | Topic                 | Status         | Key Deliverables                                                                                    |
| :------ | :-------------------- | :------------- | :-------------------------------------------------------------------------------------------------- |
| **1.1** | React 19 SPA          | ✅ Completed   | React 19, Zustand 5, TanStack Query, DnD, Tailwind v4                                               |
| **1.2** | Next.js 16 App Router | ✅ Completed   | App Router, Server Actions, Route Handlers, Edge Proxy, Hotkeys                                     |
| **1.3** | HTMX 2.0 + FastAPI    | ✅ Completed   | Server-rendered SPA, OOB Jinja2 Toasts, SortableJS                                                  |
| **1.4** | SvelteKit + Svelte 5  | ✅ Completed   | Svelte 5 Runes, Form Actions, REST API, View Transitions                                            |
| **2.1** | Node.js / Express     | ✅ Completed   | Express REST API, Prisma 6 ORM, Zod 3, JWT HttpOnly Cookies, Swagger UI, Jest                       |
| **2.2** | FastAPI Backend       | ✅ Completed   | Python async API endpoints, Pydantic v2                                                             |
| **2.3** | Go Microservices      | ✅ Completed   | Go Fiber REST API, gRPC, GORM SQLite3, JWT Cookies, WebSockets, Prometheus, Swag UI, Go Test Suite  |
| **3**   | Database Lab          | ✅ Completed   | SQLite3, PostgreSQL (JSONB/FTS), MongoDB (Aggregation), Redis (Cache/RateLimiter)                   |
| **4**   | Docker Stack & CI/CD  | ✅ Completed   | 10-Tier Stack, Nginx, Prometheus/Grafana, GitHub Actions CI, Trivy Scan, Docker Hub, doco-cd GitOps |
| **5**   | Kubernetes Manifests  | ⬜ In Future   | (In Future) Production K8s Manifests, Helm, ArgoCD                                                  |
| **6**   | AWS Terraform         | ⬜ Not Started | 3-tier VPC, EC2 ASG, RDS, ALB, S3, Route53                                                          |
| **7**   | DevDash Capstone      | ⬜ Not Started | Full-stack capstone integration project                                                             |

---

_Last Updated: 2026-08_05_
