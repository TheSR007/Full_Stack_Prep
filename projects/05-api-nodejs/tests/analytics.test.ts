import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/prisma";

describe("Analytics Module Integration Tests", () => {
  let accessToken: string;

  const testUser = {
    email: "analyticstester@taskflow.dev",
    password: "Password123!",
    name: "Analytics Tester",
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

    // Create sample tasks for analytics calculation
    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Analytics Task 1",
        status: "completed",
        priority: "urgent",
        category: "Analytics",
        dueDate: "2026-08-01",
      });

    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Analytics Task 2",
        status: "in_progress",
        priority: "medium",
        category: "Analytics",
        dueDate: "2026-08-02",
      });
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({});
    await prisma.subTask.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe("GET /api/v1/analytics", () => {
    it("should return workload analytics metrics", async () => {
      const res = await request(app)
        .get("/api/v1/analytics")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTasks).toBe(2);
      expect(res.body.data.completedTasks).toBe(1);
      expect(res.body.data.inProgressTasks).toBe(1);
      expect(res.body.data.completionRate).toBe(50);
      expect(res.body.data.priorityDistribution).toBeDefined();
    });
  });
});