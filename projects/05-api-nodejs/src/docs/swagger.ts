import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow Node.js REST API",
      version: "1.0.0",
      description:
        "Production-grade Express REST API with TypeScript, Prisma ORM, Zod validation, JWT Bearer auth, and HttpOnly cookies.",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter access token obtained from /auth/login or /auth/register",
        },
      },
      schemas: {
        Task: {
          type: "object",
          properties: {
            id: { type: "string", example: "t_101" },
            title: { type: "string", example: "Implement REST API" },
            description: { type: "string", example: "Build Express endpoints" },
            status: { type: "string", enum: ["todo", "in_progress", "completed"], example: "in_progress" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"], example: "urgent" },
            category: { type: "string", example: "Backend" },
            tags: { type: "array", items: { type: "string" }, example: ["#nodejs", "#express"] },
            dueDate: { type: "string", example: "2026-08-01" },
            createdAt: { type: "string", example: "2026-07-29T10:00:00.000Z" },
            updatedAt: { type: "string", example: "2026-07-29T12:00:00.000Z" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "u_101" },
            email: { type: "string", example: "developer@taskflow.dev" },
            name: { type: "string", example: "Dev User" },
            role: { type: "string", example: "USER" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register new user account",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "name"],
                  properties: {
                    email: { type: "string", example: "developer@taskflow.dev" },
                    password: { type: "string", example: "Password123!" },
                    name: { type: "string", example: "Dev User" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Validation error" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Authenticate user and issue tokens",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "developer@taskflow.dev" },
                    password: { type: "string", example: "Password123!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token using HttpOnly cookie",
          security: [],
          responses: {
            200: { description: "Token refreshed successfully" },
            401: { description: "Missing or invalid refresh cookie" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user and revoke refresh token",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logged out successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User profile payload" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks with search, filtering, and pagination",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["todo", "in_progress", "completed", "all"] } },
            { name: "priority", in: "query", schema: { type: "string", enum: ["low", "medium", "high", "urgent", "all"] } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "dueDate", "priorityWeight", "title"] } },
            { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          ],
          responses: {
            200: { description: "Paginated task list" },
            401: { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a new task",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "dueDate"],
                  properties: {
                    title: { type: "string", example: "Deploy Node.js API" },
                    description: { type: "string", example: "Deploy container stack to EC2" },
                    status: { type: "string", enum: ["todo", "in_progress", "completed"], default: "todo" },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"], default: "medium" },
                    category: { type: "string", example: "DevOps" },
                    tags: { type: "array", items: { type: "string" }, example: ["#aws", "#docker"] },
                    dueDate: { type: "string", example: "2026-08-10" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Task created successfully" },
            400: { description: "Validation error" },
          },
        },
      },
      "/tasks/categories": {
        get: {
          tags: ["Tasks"],
          summary: "Get list of dynamically extracted categories",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of categories" },
          },
        },
      },
      "/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task details by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Task detail payload" },
            404: { description: "Task not found" },
          },
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update task fields",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string", enum: ["todo", "in_progress", "completed"] },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                    category: { type: "string" },
                    dueDate: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Task updated successfully" },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete task by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Task deleted" },
          },
        },
      },
      "/tasks/bulk-delete": {
        post: {
          tags: ["Tasks"],
          summary: "Batch delete multiple tasks",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["taskIds"],
                  properties: {
                    taskIds: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Tasks deleted count" },
          },
        },
      },
      "/tasks/bulk-update-status": {
        patch: {
          tags: ["Tasks"],
          summary: "Batch update status of multiple tasks",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["taskIds", "status"],
                  properties: {
                    taskIds: { type: "array", items: { type: "string" } },
                    status: { type: "string", enum: ["todo", "in_progress", "completed"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Tasks updated count" },
          },
        },
      },
      "/tasks/{id}/subtasks": {
        post: {
          tags: ["Subtasks"],
          summary: "Add subtask to task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string", example: "Subtask title" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Subtask created" },
          },
        },
      },
      "/tasks/{id}/subtasks/{subtaskId}": {
        patch: {
          tags: ["Subtasks"],
          summary: "Toggle or update subtask",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "subtaskId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    completed: { type: "boolean" },
                    title: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Subtask updated" },
          },
        },
        delete: {
          tags: ["Subtasks"],
          summary: "Delete subtask",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "subtaskId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Subtask deleted" },
          },
        },
      },
      "/analytics": {
        get: {
          tags: ["Analytics"],
          summary: "Get workload analytics and metric statistics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Analytics metrics object" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};