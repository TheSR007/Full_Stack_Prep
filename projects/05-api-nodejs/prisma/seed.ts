import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing tables
  await prisma.activityLog.deleteMany({});
  await prisma.subTask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@taskflow.dev",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });

  const devUser = await prisma.user.create({
    data: {
      email: "developer@taskflow.dev",
      name: "Dev User",
      passwordHash,
      role: "USER",
    },
  });

  console.log(`Created users: Admin (${adminUser.email}), Dev (${devUser.email})`);

  // Seed Sample Tasks for Dev User
  await prisma.task.create({
    data: {
      title: "Design System Tokens",
      description: "Establish foundational color, spacing, and typography scales adhering to DESIGN.md.",
      status: "completed",
      priority: "high",
      category: "Frontend",
      tags: JSON.stringify(["#ui", "#tokens", "#css"]),
      dueDate: "2026-07-30",
      userId: devUser.id,
      subtasks: {
        create: [
          { title: "Define base color tokens", completed: true },
          { title: "Create glassmorphic overlay classes", completed: true },
        ],
      },
      history: {
        create: [
          { text: "Task created" },
          { text: "Status changed to completed" },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Node.js Express REST API",
      description: "Implement JWT authentication, Zod validation, Prisma ORM, and OpenAPI Swagger docs.",
      status: "in_progress",
      priority: "urgent",
      category: "Backend",
      tags: JSON.stringify(["#nodejs", "#express", "#jwt", "#prisma"]),
      dueDate: "2026-08-01",
      userId: devUser.id,
      subtasks: {
        create: [
          { title: "Configure Express server and security middleware", completed: true },
          { title: "Implement JWT auth & HttpOnly cookie handler", completed: true },
          { title: "Build Task CRUD & Analytics endpoints", completed: false },
        ],
      },
      history: {
        create: [
          { text: "Task created" },
          { text: "Status updated to in_progress" },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Docker Containerization",
      description: "Create optimized multi-stage Dockerfiles and local docker-compose orchestration stack.",
      status: "todo",
      priority: "medium",
      category: "DevOps",
      tags: JSON.stringify(["#docker", "#compose"]),
      dueDate: "2026-08-05",
      userId: devUser.id,
      subtasks: {
        create: [
          { title: "Write multi-stage Dockerfile for Node.js API", completed: false },
          { title: "Set up Postgres container volume mapping", completed: false },
        ],
      },
      history: {
        create: [{ text: "Task created" }],
      },
    },
  });

  console.log(`Created sample tasks for ${devUser.email}`);
  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });