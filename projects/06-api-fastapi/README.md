# TaskFlow Suite - Project 6: Task Manager REST API (FastAPI)

Production-ready, pure backend REST API built with Python 3.12+, FastAPI, async SQLAlchemy 2.0, Alembic, Pydantic v2, and Pytest. Adheres to the unified REST API specification in `API_DOCS.md` with added support for WebSockets, background tasks, file attachments, and Prometheus metrics.

---

## Tech Stack

- **Framework**: FastAPI (Async Python 3.12+)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0 Async (`async_sessionmaker` + `aiosqlite` / `asyncpg`)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT (Bearer Access Tokens + HttpOnly Refresh Cookies) with Passlib (Bcrypt)
- **Real-Time Communication**: WebSockets (`/api/v1/ws/tasks`)
- **Background Workers**: FastAPI BackgroundTasks & Celery
- **Monitoring**: Prometheus Instrumentator (`/metrics`)
- **Testing**: Pytest, Pytest-Asyncio, HTTPX

---

## Quick Start

### 1. Environment Setup

```bash
# Navigate to project directory
cd projects/06-api-fastapi

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
uvicorn app.main:app --reload --port 5000
```

- API Base Endpoint: `http://localhost:5000/api/v1`
- OpenAPI Swagger UI: `http://localhost:5000/api-docs`
- ReDoc UI: `http://localhost:5000/redoc`
- Prometheus Metrics: `http://localhost:5000/metrics`

---

## Testing

Run the automated test suite with pytest:

```bash
pytest -v
```

All tests for Auth, Tasks CRUD, Subtasks, Bulk Ops, Analytics, File Attachments, and WebSockets run against an isolated in-memory SQLite database.

---

## API Endpoints Reference

### Auth Endpoints
- `POST /api/v1/auth/register`: Register new user account
- `POST /api/v1/auth/login`: Authenticate user and issue JWT + HttpOnly cookie
- `POST /api/v1/auth/refresh`: Refresh access token using HttpOnly cookie
- `POST /api/v1/auth/logout`: Revoke tokens and clear cookie
- `GET /api/v1/auth/me`: Fetch authenticated user profile

### Task Endpoints
- `GET /api/v1/tasks`: List tasks with multi-field search, priority, status, category, tag filtering, pagination, and sorting
- `GET /api/v1/tasks/{id}`: Get single task with subtasks, history, and attachments
- `POST /api/v1/tasks`: Create task and broadcast WebSocket event
- `PUT /api/v1/tasks/{id}` / `PATCH /api/v1/tasks/{id}`: Update task properties
- `DELETE /api/v1/tasks/{id}`: Delete task
- `POST /api/v1/tasks/bulk-delete`: Delete multiple tasks by ID array
- `PATCH /api/v1/tasks/bulk-update-status`: Batch update status across tasks

### Subtask & Category Endpoints
- `POST /api/v1/tasks/{id}/subtasks`: Add subtask to task
- `PATCH /api/v1/tasks/{id}/subtasks/{subtaskId}`: Toggle completed state or rename subtask
- `DELETE /api/v1/tasks/{id}/subtasks/{subtaskId}`: Remove subtask
- `GET /api/v1/categories`: Dynamically discover categories from user tasks

### Analytics & Extensions
- `GET /api/v1/analytics`: Compute completion rate, velocity, and priority metrics
- `POST /api/v1/tasks/{id}/attachments`: Async file attachment upload
- `GET /api/v1/files/download/{file_id}`: Streaming file download
- `WS /api/v1/ws/tasks`: Real-time WebSocket connection
