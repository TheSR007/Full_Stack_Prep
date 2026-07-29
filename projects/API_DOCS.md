# TaskFlow Suite — Unified Backend REST API Specification

> **Global Source of Truth for Backend Projects 05-07**  
> Covers: `05-api-nodejs` (Express/Prisma), `06-api-fastapi` (FastAPI/SQLAlchemy), `07-api-go-microservices` (Go/Gin/gRPC)

---

## 1. System Overview & Conventions

### 1.1 Base Server URLs
- Local Development Base URL: `http://localhost:5000/api/v1`
- OpenAPI / Interactive Swagger Docs: `http://localhost:5000/api-docs`

### 1.2 Headers & Content Negotiation
- Request Body Format: `Content-Type: application/json`
- Access Authorization Header: `Authorization: Bearer <access_token>`
- Refresh Token Delivery: HttpOnly, Secure, SameSite Cookie named `refreshToken`

### 1.3 Response Envelopes

#### Success Envelope (Single Entity or Mutated Resource)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Success Envelope (Paginated Collection)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

#### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must be at least 1 character"
      }
    ]
  }
}
```

### 1.4 Standard Error Codes
- `UNAUTHORIZED` (401): Missing or invalid Bearer access token
- `FORBIDDEN` (403): Role-based access control restriction
- `NOT_FOUND` (404): Requested resource does not exist
- `VALIDATION_ERROR` (400): Zod validation failed for body, query, or path params
- `CONFLICT` (409): Duplicate email or entity key constraint
- `RATE_LIMITED` (429): Request limit exceeded
- `INTERNAL_SERVER_ERROR` (500): Unhandled operational server error

---

## 2. Authentication & User Management Endpoints

### 2.1 Register User
- **POST** `/auth/register`
- **Auth Required**: No

#### Request Body
```json
{
  "email": "developer@taskflow.dev",
  "password": "SecurePassword123!",
  "name": "Dev User"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "developer@taskflow.dev",
      "name": "Dev User",
      "role": "USER",
      "createdAt": "2026-07-29T22:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*Note: Sets HttpOnly cookie `refreshToken=...; Path=/api/v1/auth; HttpOnly; SameSite=Lax`*

---

### 2.2 Login User
- **POST** `/auth/login`
- **Auth Required**: No

#### Request Body
```json
{
  "email": "developer@taskflow.dev",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "developer@taskflow.dev",
      "name": "Dev User",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*Note: Sets HttpOnly cookie `refreshToken`*

---

### 2.3 Refresh Access Token
- **POST** `/auth/refresh`
- **Auth Required**: No (Requires valid `refreshToken` HttpOnly Cookie)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.4 Logout User
- **POST** `/auth/logout`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```
*Note: Clears `refreshToken` HttpOnly cookie and revokes token in database.*

---

### 2.5 Get Current User (`/auth/me`)
- **GET** `/auth/me`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "u_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "developer@taskflow.dev",
    "name": "Dev User",
    "role": "USER",
    "createdAt": "2026-07-29T22:30:00.000Z"
  }
}
```

---

## 3. Task Management Endpoints

### 3.1 List Tasks
- **GET** `/tasks`
- **Auth Required**: Yes
- **Query Parameters**:
  - `search` (string, optional): Multi-field live search (title, description, tags)
  - `status` (string, optional): `todo`, `in_progress`, `completed`, `all` (default: `all`)
  - `priority` (string, optional): `low`, `medium`, `high`, `urgent`, `all` (default: `all`)
  - `category` (string, optional): Dynamic category name or `all`
  - `tag` (string, optional): Specific tag filter (e.g. `#api`)
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `sortBy` (string, optional): `createdAt`, `dueDate`, `priorityWeight`, `title` (default: `createdAt`)
  - `sortOrder` (string, optional): `asc`, `desc` (default: `desc`)

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "t_101",
      "title": "Implement JWT Auth Middleware",
      "description": "Add Bearer access token check and HttpOnly cookie refresh handler.",
      "status": "in_progress",
      "priority": "urgent",
      "category": "Backend",
      "tags": ["#nodejs", "#express", "#jwt"],
      "dueDate": "2026-08-01",
      "createdAt": "2026-07-29T10:00:00.000Z",
      "updatedAt": "2026-07-29T12:00:00.000Z",
      "subtasks": [
        {
          "id": "st_1",
          "title": "Create jwt verify function",
          "completed": true
        }
      ],
      "history": [
        {
          "id": "h_1",
          "text": "Task created",
          "timestamp": "2026-07-29T10:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3.2 Get Task by ID
- **GET** `/tasks/:id`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "t_101",
    "title": "Implement JWT Auth Middleware",
    "description": "Add Bearer access token check and HttpOnly cookie refresh handler.",
    "status": "in_progress",
    "priority": "urgent",
    "category": "Backend",
    "tags": ["#nodejs", "#express", "#jwt"],
    "dueDate": "2026-08-01",
    "createdAt": "2026-07-29T10:00:00.000Z",
    "updatedAt": "2026-07-29T12:00:00.000Z",
    "subtasks": [],
    "history": []
  }
}
```

---

### 3.3 Create Task
- **POST** `/tasks`
- **Auth Required**: Yes

#### Request Body
```json
{
  "title": "Setup Prisma Migrations",
  "description": "Initialize SQLite database schema and run dev migration.",
  "status": "todo",
  "priority": "high",
  "category": "Database",
  "tags": ["#prisma", "#sqlite"],
  "dueDate": "2026-08-05"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "t_102",
    "title": "Setup Prisma Migrations",
    "description": "Initialize SQLite database schema and run dev migration.",
    "status": "todo",
    "priority": "high",
    "category": "Database",
    "tags": ["#prisma", "#sqlite"],
    "dueDate": "2026-08-05",
    "createdAt": "2026-07-29T22:35:00.000Z",
    "updatedAt": "2026-07-29T22:35:00.000Z"
  }
}
```

---

### 3.4 Update Task
- **PUT** `/tasks/:id` or **PATCH** `/tasks/:id`
- **Auth Required**: Yes

#### Request Body
```json
{
  "status": "completed",
  "priority": "medium"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "t_102",
    "title": "Setup Prisma Migrations",
    "description": "Initialize SQLite database schema and run dev migration.",
    "status": "completed",
    "priority": "medium",
    "category": "Database",
    "tags": ["#prisma", "#sqlite"],
    "dueDate": "2026-08-05",
    "createdAt": "2026-07-29T22:35:00.000Z",
    "updatedAt": "2026-07-29T22:40:00.000Z"
  }
}
```

---

### 3.5 Delete Task
- **DELETE** `/tasks/:id`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "t_102",
    "message": "Task deleted successfully"
  }
}
```

---

### 3.6 Bulk Delete Tasks
- **POST** `/tasks/bulk-delete`
- **Auth Required**: Yes

#### Request Body
```json
{
  "taskIds": ["t_101", "t_102"]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "count": 2,
    "message": "2 tasks deleted successfully"
  }
}
```

---

### 3.7 Bulk Update Task Status
- **PATCH** `/tasks/bulk-update-status`
- **Auth Required**: Yes

#### Request Body
```json
{
  "taskIds": ["t_101", "t_102"],
  "status": "completed"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "count": 2,
    "message": "2 tasks updated to completed status"
  }
}
```

---

## 4. Category & Subtask Endpoints

### 4.1 List Dynamic Categories
- **GET** `/categories`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    "Backend",
    "Database",
    "DevOps",
    "Frontend"
  ]
}
```

---

### 4.2 Create Subtask
- **POST** `/tasks/:id/subtasks`
- **Auth Required**: Yes

#### Request Body
```json
{
  "title": "Configure Zod Schema Validation"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "st_2",
    "taskId": "t_101",
    "title": "Configure Zod Schema Validation",
    "completed": false,
    "createdAt": "2026-07-29T22:45:00.000Z"
  }
}
```

---

### 4.3 Update Subtask
- **PATCH** `/tasks/:id/subtasks/:subtaskId`
- **Auth Required**: Yes

#### Request Body
```json
{
  "completed": true
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "st_2",
    "taskId": "t_101",
    "title": "Configure Zod Schema Validation",
    "completed": true,
    "updatedAt": "2026-07-29T22:50:00.000Z"
  }
}
```

---

### 4.4 Delete Subtask
- **DELETE** `/tasks/:id/subtasks/:subtaskId`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "st_2",
    "message": "Subtask deleted"
  }
}
```

---

## 5. Analytics & Metrics Endpoint

### 5.1 Get Task Analytics
- **GET** `/analytics`
- **Auth Required**: Yes

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalTasks": 24,
    "completedTasks": 16,
    "inProgressTasks": 5,
    "urgentTasks": 3,
    "completionRate": 66.67,
    "velocity": {
      "completedThisWeek": 8,
      "trend": "up"
    },
    "priorityDistribution": {
      "low": 4,
      "medium": 10,
      "high": 7,
      "urgent": 3
    }
  }
}
```
