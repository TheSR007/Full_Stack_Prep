# Project 5: Node.js Express REST API (`05-api-nodejs`)

> Production-ready RESTful API service built with Express, TypeScript, Prisma ORM, Zod validation, and JWT authentication with HttpOnly refresh tokens.

---

## Technical Features & Capabilities

- **User Authentication & RBAC**:
  - Short-lived JWT Access Tokens (15-minute expiry) passed via Bearer header.
  - Long-lived Refresh Tokens (7-day expiry) stored in database and set as HttpOnly cookies (`refreshToken`).
  - Role-based authorization (`USER` and `ADMIN`).
- **Task Management**:
  - Full CRUD operations with title, description, status, priority, category, tags, and due dates.
  - Dynamic category extraction and multi-criteria sorting (Created Date, Due Date, Priority Weight, Title).
  - Bulk actions: batch delete and batch status update.
  - Subtask checklist management and automatic activity log tracking.
- **Real-Time Analytics Engine**:
  - Workload metrics: total count, completed count, in-progress count, urgent count.
  - Completion percentage rate and weekly completion velocity.
  - Priority distribution breakdown.
- **Security & Quality**:
  - Zod schema validation middleware for body, query, and path parameters.
  - Security headers via Helmet, restricted CORS configuration, and Express rate limiting.
  - Centralized operational error handler and structured Winston logging.
- **API Documentation & Testing**:
  - Interactive OpenAPI 3.0 Swagger UI hosted at `http://localhost:5000/api-docs`.
  - Comprehensive unit and integration test suite using Jest and Supertest (`npm test`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime & Language** | Node.js, TypeScript 5 |
| **Web Framework** | Express 5 |
| **ORM & Database** | Prisma 6, SQLite / PostgreSQL |
| **Validation** | Zod 3 |
| **Auth & Security** | JSON Web Tokens (jsonwebtoken), bcryptjs, cookie-parser, helmet, express-rate-limit |
| **Logging & Docs** | Winston, Morgan, Swagger UI Express, Swagger JSDoc |
| **Testing** | Jest, Supertest, ts-jest |

---

## Setup & Running Instructions

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Installation & Environment Configuration
```bash
# Navigate to project directory
cd projects/05-api-nodejs

# Install dependencies
npm install

# Copy environment variables file
cp .env.example .env
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Apply initial database migration
npx prisma migrate dev --name init

# Seed database with initial users and tasks
npx prisma db seed
```

### 4. Running Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

- Health Check Endpoint: `http://localhost:5000/health`
- Interactive OpenAPI Swagger Docs: `http://localhost:5000/api-docs`

---

## Testing

Execute the automated test suite covering Auth, Task CRUD, and Analytics:

```bash
npm test
```

Default Test Accounts created during seeding:
- **Standard User**: `developer@taskflow.dev` / `Password123!`
- **Admin User**: `admin@taskflow.dev` / `Password123!`
