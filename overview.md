> **Goal:** Build full-stack proficiency across Frontend, Backend, DevOps, and AWS Deployment through hands-on test projects.

---

## Tech Stack Overview

| Layer        | Technologies                                        | Status         | Test Project                                        |
| ------------ | --------------------------------------------------- | -------------- | --------------------------------------------------- |
| **Frontend** | Next.js, React, HTMX, Svelte                        | ✅ Completed   | Task Manager UI ✅                                  |
| **Backend**  | Node.js, Go (Microservices), FastAPI                | ✅ Completed   | Task Manager API (Node.js & FastAPI APIs Completed) |
| **Database** | SQLite3, PostgreSQL, MongoDB, Redis                 | ⬜ Not Started | Multi-DB Task Store                                 |
| **DevOps**   | Docker, Docker Compose, K8s, GitHub Actions, ArgoCD | ⬜ Not Started | Containerized Pipeline                              |
| **AWS**      | VPC, EC2, ALB, RDS, S3, Route53                     | ⬜ Not Started | Cloud Deployment                                    |

---

## Learning Roadmap (1-Week Sprint)

### Phase 1: Foundation (Day 1-2)

**Goal:** Get comfortable with each technology in isolation.

#### Day 1: Frontend Quartet

- React Fundamentals (Hooks, Context, Custom Hooks)
- Next.js (App Router, SSR/SSG, API Routes, Middleware)
- HTMX (Server-rendered interactivity, hx-\* attributes, hyperscript)
- SvelteKit (Runes, SSR/CSR, form actions, load functions, endpoints)

**Deliverable:** Four versions of a Task Manager UI

- `01-task-manager-react/` - ✅ **Completed** (React 19 SPA + Zustand + TanStack Query + DnD + Dynamic Category Discovery + Filter/Sort Toolbar + Lucide Icons + Tailwind v4)
- `02-task-manager-nextjs/` - ✅ **Completed** (Next.js 15 App Router + Server Actions + Route Handlers + Edge Middleware + Metadata + Streaming Loading + Error Boundaries + DnD + Multi-Field Search + Subtasks + Bulk Ops + Export/Import + Keyboard Hotkeys)
- `03-task-manager-htmx/` - ✅ **Completed** (HTMX 2.0 + FastAPI + Jinja2 + Active Search + OOB Toasts + SortableJS + Dynamic Category Discovery + Filter/Sort Toolbar + Lucide Icons)
- `04-task-manager-svelte/` - ✅ **Completed** (Svelte 5 Runes + SvelteKit + Form Actions + Server Load + REST Route Handlers + Server Hooks + View Transitions API + DnD + Glassmorphism)

#### Day 2: Backend Trio

- Node.js/Express (REST API, middleware, error handling, JWT auth)
- FastAPI (async endpoints, Pydantic models, dependency injection, OpenAPI docs)
- Go Microservices (Gin/Fiber, goroutines, channels, gRPC basics, service discovery)

**Deliverable:** Three versions of Task Manager API

- `05-api-nodejs/` - ✅ **Completed** (Express + TypeScript + Prisma 6 + Zod + JWT Cookies + Winston + Swagger UI + Jest)
- `06-api-fastapi/` - ✅ **Completed** (FastAPI + Python async + SQLAlchemy 2.0 + Alembic + Pydantic v2 + JWT Cookies + WebSockets + BackgroundTasks + Prometheus + Pytest)
- `07-api-go-microservices/` - Go microservices (User Service + Task Service)

---

### Phase 2: Data Layer (Day 3)

**Goal:** Master databases and caching strategies.

- SQLite3 (local dev, migrations, ACID)
- PostgreSQL (advanced queries, indexing, JSONB, full-text search)
- MongoDB (schema design, aggregation pipeline, replica sets)
- Redis (caching strategies, session store, pub/sub, rate limiting)

**Deliverable:** `database-lab/`

- Same Task Manager schema implemented in all 4 databases
- Performance comparison script
- Redis caching layer for Node.js API

---

### Phase 3: Containerization (Day 4)

**Goal:** Dockerize everything and orchestrate locally.

- Docker fundamentals (Dockerfile best practices, multi-stage builds, layer caching)
- Docker Compose (multi-service orchestration, networks, volumes, env management)
- Kubernetes basics (Pods, Services, Deployments, ConfigMaps, Secrets, Ingress)

**Deliverable:** `infra-docker/`

- Dockerfiles for all services
- `docker-compose.yml` running full stack (Frontend + Backend + DB + Redis)
- K8s manifests for local deployment (minikube/kind)

---

### Phase 4: CI/CD Pipeline (Day 5)

**Goal:** Automate testing, security, and deployment.

- GitHub Actions (workflows, matrix builds, caching, artifacts)
- Linting & Security (ESLint, Prettier, Black, golangci-lint, Trivy, Snyk, SonarQube)
- CI Pipeline (test → lint → security scan → build → push to registry)
- CD Options (GitHub Actions SSH deploy vs ArgoCD)

**Deliverable:** `.github/workflows/`

- `ci.yml` - Full CI pipeline
- `cd-vps.yml` - SSH deployment to VPS
- `cd-argocd.yml` - GitOps with ArgoCD manifests

---

### Phase 5: AWS Deployment (Day 6)

**Goal:** Deploy to AWS with production-grade architecture.

#### AWS Infrastructure

- VPC Setup (CIDR blocks, subnets: public/private, NAT Gateway, IGW, route tables)
- EC2 & Security (Launch templates, Security Groups, IAM roles, SSM, user-data scripts)
- Load Balancing (ALB, target groups, health checks, SSL/TLS with ACM)
- Database on AWS (RDS PostgreSQL, parameter groups, backups, read replicas)
- Storage & DNS (S3 buckets, CloudFront, Route53 hosted zones, records)
- Infrastructure as Code (Terraform or AWS CDK)

**Deliverable:** `infra-aws/`

- Terraform modules: VPC, EC2, RDS, ALB, S3, Route53
- Architecture diagram

#### Full AWS Deployment

- Deploy containerized app to EC2 (Docker on EC2, ECR registry)
- Alternative: ECS Fargate (serverless containers)
- Alternative: EKS (managed Kubernetes)
- Monitoring (CloudWatch, alarms, dashboards, X-Ray tracing)

---

### Phase 6: Integration & Polish (Day 7)

**Goal:** Build a capstone project and create cheatsheets.

- Build **"DevDash"** - A developer dashboard combining everything
    - Next.js frontend with real-time updates (WebSocket/SSE)
    - Go microservices backend
    - PostgreSQL + Redis + MongoDB for different data types
    - Full Docker + K8s deployment
    - GitHub Actions CI/CD
    - AWS deployment

- Create comprehensive cheatsheets
- Mock hackathon (48-hour sprint with a sample problem)

---

## Project Structure

```
hackathon-prep/
├── README.md
├── overview.md              # This file
├── cheatsheets/             # Quick reference guides
│   ├── argocd.md
│   ├── aws-services.md
│   ├── docker.md
│   ├── fastapi.md
│   ├── github-actions.md
│   ├── go.md
│   ├── htmx.md
│   ├── kubernetes.md
│   ├── mongodb.md
│   ├── nextjs.md
│   ├── nodejs.md
│   ├── postgres.md
│   ├── react.md
│   ├── redis.md
│   └── sveltekit.md
├── projects/
│   ├── DESIGN.md            # Global Source of Truth for Projects 1-4 UI/UX
│   ├── API_DOCS.md          # Global Source of Truth for Projects 5-7 REST API
│   ├── 01-task-manager-react/
│   ├── 02-task-manager-nextjs/
│   ├── 03-task-manager-htmx/
│   ├── 04-task-manager-svelte/
│   ├── 05-api-nodejs/
│   ├── 06-api-fastapi/
│   ├── 07-api-go-microservices/
│   ├── 08-database-lab/
│   ├── 09-docker-compose-stack/
│   ├── 10-k8s-manifests/
│   ├── 11-github-actions-ci/
│   ├── 12-aws-terraform/
│   └── 13-devdash-capstone/
└── resources/
    ├── architecture-diagrams/
    ├── aws-cost-estimates/
    └── hackathon-tips.md
```

---

## Test Projects Detail

### Standardized Core Features across Frontend Projects (1-4)

All four implementations (React, Next.js, HTMX, SvelteKit) share the **exact same core UI and business capabilities**:

- **Full Task CRUD**: Create, view, edit, delete tasks with inline/modal forms & validation.
- **Attributes**: Title, detailed description, status (`todo`, `in_progress`, `completed`), priority (`low`, `medium`, `high`, `urgent`), due date, categories, and tags (`#tag`).
- **Dual View Modes**: Interactive Kanban Board (Drag-and-Drop / column status re-ordering with top border glowing accents) and Data Table/List View.
- **Dynamic Category Discovery**: Categories are extracted dynamically from active task items (deduplicated case-insensitively and sorted alphabetically) with `All Categories` fallback.
- **Filter & Sort Toolbar**: Priority filter, dynamic category filter, and multi-criteria sorting (Date Created, Due Date, Priority Weight, Task Title).
- **Real-Time Analytics Dashboard (`/analytics`)**: Completion velocity tracking, completion rate progress bar (`%`), stat cards (`Total`, `Completed`, `In Progress`, `Urgent`), and priority distribution metrics.
- **Settings & Preferences (`/settings`)**: Theme preferences (Light/Dark mode) and state store persistence reset controls.
- **Dynamic Routing & Detail Pages (`/tasks/:id`)**: Deep linking to task details, breadcrumb back navigation, metadata cards grid, tag badges, and quick status switchers.
- **Lucide Vector Iconography**: Uniform vector iconography across all controls, eliminating structural emojis.
- **Compact Auto-Fitting Modals**: Centered overlays with fixed header, scrollable body, and fixed accessible action footer.
- **Dark Mode & Responsive UI**: Seamless dark/light theme toggle and mobile responsiveness adhering to `DESIGN.md`.
- **Toast Notifications**: Dynamic action feedback toasts (`success`, `info`, `warning`).

---

### Standardized Core Features across Backend Projects (5-7)

All three backend implementations (Node.js, FastAPI, Go Microservices) strictly adhere to **[API_DOCS.md](./projects/API_DOCS.md)**:

- **RESTful Endpoint Schema**: Uniform `/api/v1` route paths (`/auth`, `/tasks`, `/categories`, `/analytics`).
- **OpenAPI / Swagger UI**: Interactive Swagger documentation available at `/api-docs`.
- **Response Envelope Standard**: Standardized `{ success: true, data, meta }` for success and `{ success: false, error: { code, message, details } }` for errors.
- **Dual-Token Authentication**: Short-lived JWT Access Tokens (`Authorization: Bearer <token>`, 15m) + Long-lived Refresh Tokens stored in database and delivered via secure HttpOnly cookie (`refreshToken`, 7d).
- **Role-Based Access Control (RBAC)**: Role checks (`USER` and `ADMIN`) restricting resources based on account privileges.
- **Validation & Error Normalization**: Schema validation (Zod in Node.js, Pydantic in FastAPI, Struct validation in Go) and standardized error codes (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_SERVER_ERROR`).
- **Entity & Analytics Parity**: Exact data parity across Tasks, Subtasks, Activity Log history, Dynamic Categories, and Analytics metrics calculations.

---

### Project 1: Task Manager (React) — ✅ Completed

**Scope:** Pure React SPA covering full React core ecosystem
**Tech:** React 19, Vite 8, React Router v7, Tailwind CSS v4, TanStack Query v5, Zustand v5, TypeScript, `@hello-pangea/dnd`, Lucide Icons
**Status:** ✅ Completed with unified `DESIGN.md` glassmorphism, responsive high-res views, screenshots, and complete tests/cheatsheet.
**Features:**

- Multi-page routing (`/`, `/tasks`, `/tasks/:id`, `/analytics`, `/settings`) with React Router v7 & lazy Suspense fallback
- React Context API (`ThemeContext` with Fast Refresh compliance) + Zustand persistent store (`useTaskStore`)
- Dynamic Modals using React Portals (`createPortal`) with accessible forms & tag management
- Interactive Drag-and-drop Kanban Board (`@hello-pangea/dnd`)
- Dynamic category discovery with case-insensitive matching & filter/sort toolbar
- Custom Hooks (`useDebounce`, `useDocumentTitle`)
- React Error Boundaries & high-res visual previews

### Project 2: Task Manager (Next.js) — ✅ Completed

**Scope:** Full-stack showcase with App Router, Server Actions, Route Handlers & Edge Proxy
**Tech:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand v5, TanStack Query v5, `@hello-pangea/dnd`, Lucide Icons
**Status:** ✅ Completed with unified `DESIGN.md` glassmorphism, responsive high-res views, screenshots, and complete tests/cheatsheet.
**Features:**

- Standardized Projects 1-4 UI & feature parity (Kanban Board, Task List Table, Analytics Dashboard, Detail Pages, Settings)
- Server Components + Client Components architecture with clean `"use client"` boundaries
- Server Actions (`"use server"`) for mutations with `revalidatePath` cache updates
- REST Route Handlers (`src/app/api/tasks/route.ts` & `[id]/route.ts`)
- Next.js 16 Edge Proxy (`src/proxy.ts`) with custom header injection
- Dynamic Metadata (`generateMetadata`) for dynamic task detail routes
- Instant Streaming Loading (`loading.tsx`), Custom Error Boundaries (`error.tsx`), and Custom 404 (`not-found.tsx`)
- Extended Features: Multi-field live search & highlight, sub-tasks checklist progress bars, activity timestamp log, multi-select bulk batch operations, JSON/CSV exports, JSON imports, and global hotkeys engine (`N`, `/`, `B`, `L`, `?`, `Esc`)

### Project 3: Task Manager (HTMX) — ✅ Completed

**Scope:** Server-rendered SPA feel with FastAPI backend
**Tech:** HTMX 2.0 + FastAPI + Jinja2 + SortableJS + Lucide Icons + Tailwind CSS
**Status:** ✅ Completed with full feature parity, dynamic category discovery, filter/sort toolbar, OOB toasts, responsive views, and README screenshots.
**Features:**

- Standardized Projects 1-4 UI & feature parity
- `hx-get`/`hx-put`/`hx-post`/`hx-delete` HTMX patterns
- Dynamic target swapping for Kanban columns & inline data table rows
- SortableJS drag-and-drop integration for status re-ordering
- Active search & multi-parameter filter/sort toolbar
- Dynamic category discovery from in-memory engine with case-insensitive matching
- Out-Of-Band (OOB) Toast notifications via Jinja2 template rendering

### Project 4: Task Manager (SvelteKit) — ✅ Completed

**Scope:** Full-stack with Svelte 5 Runes, SSR, Form Actions, REST API Handlers & View Transitions
**Tech:** Svelte 5 (Runes), SvelteKit, TypeScript, Tailwind CSS v4, `svelte-dnd-action`, Lucide Svelte
**Status:** ✅ Completed with unified `DESIGN.md` glassmorphism, responsive high-res views, screenshots, and complete tests/cheatsheet.
**Features:**

- Standardized Projects 1-4 UI & feature parity
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)
- Server-side rendering (`+page.server.ts`) & SvelteKit Form Actions with progressive enhancement (`use:enhance`)
- REST API Route Handlers (`src/routes/api/tasks/+server.ts` & `[id]/+server.ts`)
- Server handle hook (`src/hooks.server.ts`) for custom header injection and request timing
- View Transitions API integration (`onNavigate`) in layout
- Custom 404 / 500 error boundary page (`+error.svelte`)

### Project 5: API (Node.js) - ✅ Completed

**Scope:** Production-ready REST API
**Tech:** Express 5, TypeScript 5, Prisma 6 ORM, Zod 3, JWT (Bearer + HttpOnly Cookies), Winston, Morgan, Swagger UI, Jest, Supertest
**Status:** Completed with full REST API endpoints, JWT auth with HttpOnly refresh cookies, Zod validation, Prisma 6 ORM, Winston logging, OpenAPI Swagger UI (`/api-docs`), global `API_DOCS.md`, and 100% passing Jest test suite.
**Features:**

- User Auth endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`) with bcrypt password hashing and HttpOnly cookie management
- Task CRUD endpoints (`/tasks`, `/tasks/:id`) with pagination, search, priority/category filtering, and multi-criteria sorting
- Bulk batch operation endpoints (`/tasks/bulk-delete`, `/tasks/bulk-update-status`)
- Subtask checklist endpoints (`/tasks/:id/subtasks`, `/tasks/:id/subtasks/:subtaskId`) and automatic activity logging
- Analytics endpoint (`/analytics`) calculating workload totals, completion velocity, completion percentage rate, and priority distribution
- Security & Quality: Helmet security headers, CORS origin restrictions, Express rate limiters, centralized operational error handler, Winston logger
- Interactive OpenAPI 3.0 Swagger UI documentation (`/api-docs`) and comprehensive Jest test suite (`tests/auth.test.ts`, `tests/tasks.test.ts`, `tests/analytics.test.ts`)

### Project 6: API (FastAPI) - ✅ Completed

**Scope:** Production-ready Async Python API
**Tech:** FastAPI + SQLAlchemy 2.0 Async + Alembic + Pydantic v2 + Pytest + Uvicorn
**Status:** Completed with full REST API endpoints adhering to `API_DOCS.md`, JWT auth with HttpOnly refresh cookies, Pydantic v2 validation, WebSockets, background tasks, file attachment upload/download, Prometheus metrics, OpenAPI Swagger UI (/api-docs), and comprehensive Pytest test suite.
**Features:**

- Async database operations with SQLAlchemy 2.0 and aiosqlite
- Background tasks (FastAPI BackgroundTasks & Celery integration)
- WebSocket endpoint (`/api/v1/ws/tasks`) for real-time task updates
- File attachment upload and streaming download (`/api/v1/files/download/{file_id}`)
- Dependency injection patterns (`get_async_db`, `get_current_user`, `require_admin`)
- Custom middleware (`X-Response-Time`, standardized error envelope normalization)
- Prometheus metrics instrumentation (`/metrics`)
- OpenAPI / Swagger UI custom path (`/api-docs`) and comprehensive Pytest suite

### Project 7: API (Go Microservices)

**Scope:** Distributed system architecture
**Tech:** Go + Gin + gRPC + PostgreSQL + NATS/RabbitMQ
**Services:**

- `api-gateway/` - HTTP → gRPC translation
- `user-service/` - Auth & user management
- `task-service/` - Task CRUD + business logic
- `notification-service/` - Email/push notifications
- `shared/` - Common packages (models, middleware, utils)
  **Features:**
- Inter-service communication (gRPC + HTTP)
- Circuit breaker pattern
- Distributed tracing (Jaeger)
- Health checks & readiness probes
- Graceful degradation

### Project 8: Database Lab

**Scope:** Compare databases for same schema
**Schema:** Users, Tasks, Categories, Tags, Comments
**Experiments:**

- ACID vs BASE transaction models
- Query performance benchmarking
- Migration strategies (up/down)
- Backup/restore procedures
- Redis caching layer implementation
- Full-text search comparison (PostgreSQL vs MongoDB)

### Project 9: Docker Compose Stack

**Scope:** Full local development environment
**Services:**

- `frontend` (Next.js)
- `api` (FastAPI)
- `worker` (Celery)
- `postgres` (PostgreSQL)
- `redis` (Redis)
- `mongo` (MongoDB)
- `nginx` (Reverse proxy)
- `prometheus` + `grafana` (Monitoring)
  **Features:**
- Hot reload for dev
- Multi-stage builds for prod
- Health checks
- Log aggregation
- Network isolation

### Project 10: Kubernetes Manifests

**Scope:** K8s deployment for the stack
**Resources:**

- Namespaces
- Deployments with HPA
- Services (ClusterIP, NodePort, LoadBalancer)
- ConfigMaps & Secrets
- PersistentVolumeClaims
- Ingress with TLS
- NetworkPolicies
- PodDisruptionBudgets

### Project 11: GitHub Actions CI/CD

**Scope:** Complete automation pipeline
**Workflows:**

- `pr-check.yml` - Lint, test, security scan on PR
- `build-push.yml` - Build & push to Docker Hub/ECR
- `deploy-vps.yml` - SSH deploy with zero-downtime
- `deploy-argocd.yml` - GitOps sync
  **Tools:**
- ESLint, Prettier, Black, golangci-lint
- Trivy (container scanning)
- SonarQube (code quality)
- Snyk (dependency vulnerabilities)
- OWASP ZAP (DAST)

### Project 12: AWS Terraform

**Scope:** Infrastructure as Code
**Modules:**

- `vpc/` - 3-tier VPC with public/private subnets
- `compute/` - EC2 ASG, Launch Templates
- `database/` - RDS PostgreSQL, ElastiCache Redis
- `loadbalancer/` - ALB, Target Groups, ACM SSL
- `storage/` - S3, CloudFront
- `dns/` - Route53 zones & records
- `iam/` - Roles, Policies, Instance Profiles
- `monitoring/` - CloudWatch alarms, SNS

### Project 13: DevDash Capstone

**Scope:** Real-world full-stack application
**Concept:** Developer productivity dashboard
**Features:**

- GitHub integration (repos, PRs, issues)
- CI/CD pipeline visualization
- System health monitoring
- Team task board
- Real-time notifications (WebSocket)
- Dark/light theme
- Mobile responsive
  **Architecture:**
- Next.js frontend (Vercel or S3+CloudFront)
- Go API Gateway (ECS/EKS)
- Node.js + FastAPI microservices (ECS)
- PostgreSQL (RDS) + MongoDB (DocumentDB) + Redis (ElastiCache)
- S3 for file storage
- CloudWatch for monitoring

---

## Daily Practice Template

```markdown
## Day X: [Topic]

### Learning Objectives

- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

### Resources

- Documentation: [link]
- Tutorial: [link]
- Video: [link]

### Implementation

- [ ] Create project directory
- [ ] Follow tutorial/build from scratch
- [ ] Add custom features beyond tutorial
- [ ] Write tests
- [ ] Document in cheatsheet

### Cheatsheet Notes

- Key commands
- Common patterns
- Gotchas & solutions
- Performance tips

### Time Tracking

- Learning: \_\_\_ hours
- Coding: \_\_\_ hours
- Debugging: \_\_\_ hours
- Total: \_\_\_ hours
```

---

## Cheatsheet Structure Template

Each cheatsheet should include:

1. **Quick Start** - 5-minute setup
2. **Core Concepts** - Diagram + explanation
3. **Common Commands** - Copy-paste ready
4. **Code Patterns** - 5 most common patterns
5. **Configuration** - Best practice configs
6. **Debugging** - Common errors & fixes
7. **Performance** - Optimization tips
8. **Security** - Hardening checklist
9. **Resources** - Links for deep dives

---

## Hackathon Day Strategy

### Pre-Hackathon Checklist

- [ ] All cheatsheets printed/accessible offline
- [ ] Docker images pre-built and cached
- [ ] AWS credentials configured
- [ ] Development environment scripted (dotfiles, setup scripts)
- [ ] Template repos forked and ready
- [ ] Team communication tools ready (Discord/Slack)
- [ ] Sleep schedule adjusted

### During Hackathon

**Hour 0-1:** Ideation & Architecture

- Whiteboard the architecture
- Choose tech stack (use what you practiced!)
- Set up repo structure
- Divide tasks

**Hour 1-4:** MVP Backend

- Database schema
- Core API endpoints
- Docker setup

**Hour 4-8:** MVP Frontend

- Wireframe to code
- Connect to backend
- Basic styling

**Hour 8-16:** Feature Completion

- Implement all required features
- Integration testing
- Bug fixes

**Hour 16-20:** Polish

- UI/UX improvements
- Error handling
- Loading states
- Documentation

**Hour 20-24:** Deployment & Demo Prep

- Deploy to AWS
- Prepare demo script
- Practice presentation
- Backup plan (local demo)

### Post-Hackathon

- [ ] Document learnings
- [ ] Update cheatsheets with new findings
- [ ] Open source the project (if allowed)
- [ ] Rest!

---

## Recommended Resources

### Frontend

- [Next.js Documentation](https://nextjs.org/docs)
- [React Patterns](https://reactpatterns.com/)
- [HTMX Documentation](https://htmx.org/docs/)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Backend

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Go by Example](https://gobyexample.com/)
- [Microservices Patterns](https://microservices.io/patterns/)

### Database

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [Redis Commands](https://redis.io/commands/)
- [SQLBolt](https://sqlbolt.com/)

### DevOps

- [Docker Docs](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [ArgoCD](https://argo-cd.readthedocs.io/)

### AWS

- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [Terraform AWS Modules](https://registry.terraform.io/modules/terraform-aws-modules)
- [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)

---

## AWS Cost Management

| Service           | Free Tier     | Est. Monthly Cost (Dev) |
| ----------------- | ------------- | ----------------------- |
| EC2 (t3.micro)    | 750 hrs/month | $0 (within free tier)   |
| RDS (db.t3.micro) | 750 hrs/month | $0 (within free tier)   |
| S3                | 5GB storage   | $0-1                    |
| ALB               | N/A           | ~$16/month              |
| Route53           | N/A           | ~$0.50/zone/month       |
| CloudWatch        | 10 metrics    | $0-5                    |
| **Total**         |               | **~$20-25/month**       |

**Cost Optimization Tips:**

- Use AWS Cost Explorer
- Set up billing alerts
- Stop instances when not in use
- Use Spot instances for non-critical workloads
- Clean up resources after each practice session

---

## Progress Tracker

| Day | Topic            | Status | Hours | Key Learnings                                                                                                                   |
| --- | ---------------- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | React            | ✅     | 2     | React 19, Hooks, Context, Zustand 5, TanStack Query v5, `@hello-pangea/dnd`, Tailwind v4                                        |
| 1.2 | Next.js          | ✅     | 1.5   | Next.js 15 App Router, Server Actions, Route Handlers, Edge Middleware, Metadata, Streaming, Error Boundaries, Zustand, DnD     |
| 1.3 | HTMX             | ✅     | 2     | HTMX 2.0, FastAPI, Jinja2 partials, Active Search, OOB Toasts, SortableJS, Glassmorphism                                        |
| 1.4 | SvelteKit        | ✅     | 2     | Svelte 5 Runes ($state, $derived, $effect), Form Actions, Server Load, REST API (+server.ts), View Transitions, hooks.server.ts |
| 2.1 | Node.js          | ✅     | 2     | Express 5, TypeScript 5, Prisma 6 ORM, Zod 3, JWT HttpOnly Cookies, Winston, OpenAPI Swagger UI, Jest                           |
| 2.2 | FastAPI          | ✅     | 1     | FastAPI, SQLAlchemy 2.0 Async, Pydantic v2, JWT HttpOnly Cookies, WebSockets, BackgroundTasks, Prometheus, Pytest               |
| 2.3 | Go Microservices | ⬜     | 0     |                                                                                                                                 |
| 3   | Databases        | ⬜     | 0     |                                                                                                                                 |
| 4   | Docker & K8s     | ⬜     | 0     |                                                                                                                                 |
| 5   | CI/CD            | ⬜     | 0     |                                                                                                                                 |
| 6   | AWS              | ⬜     | 0     |                                                                                                                                 |
| 7   | Capstone         | ⬜     | 0     |                                                                                                                                 |

---

## 🎓 Success Metrics

By the end of this preparation:

- [ ] Can scaffold a full-stack app in 30 minutes
- [ ] Can Dockerize any application
- [ ] Can set up CI/CD in under 1 hour
- [ ] Can deploy to AWS without docs
- [ ] Have 13+ working project examples
- [ ] Have comprehensive cheatsheets for all technologies
- [ ] Can explain architecture decisions confidently
- [ ] Ready for 24-48 hour hackathon sprint

---

_Last Updated: 2026-07-30_
