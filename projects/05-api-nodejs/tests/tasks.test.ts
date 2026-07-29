import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/prisma";

describe("Tasks Module Integration Tests", () => {
  let accessToken: string;
  let createdTaskId: string;

  const testUser = {
    email: "tasktester@taskflow.dev",
    password: "Password123!",
    name: "Task Tester",
  };

  beforeAll(async () => {
    await prisma.activityLog.deleteMany({});
    await prisma.subTask.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send(testUser);

    accessToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({});
    await prisma.subTask.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/tasks", () => {
    it("should create a new task successfully", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Integration Test Task",
          description: "Testing API endpoint for creation",
          status: "todo",
          priority: "high",
          category: "Testing",
          tags: ["#jest", "#api"],
          dueDate: "2026-08-10",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Integration Test Task");
      createdTaskId = res.body.data.id;
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("should list created tasks for authenticated user", async () => {
      const res = await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/v1/tasks/:id", () => {
    it("should update task status to completed", async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          status: "completed",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("completed");
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("should delete task by id", async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdTaskId);
    });
  });
});