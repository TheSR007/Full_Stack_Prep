import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/prisma";

describe("Auth Module Integration Tests", () => {
  beforeAll(async () => {
    // Clean up test tables
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: "testuser@taskflow.dev" } });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: "testuser@taskflow.dev" } });
    await prisma.$disconnect();
  });

  const testUser = {
    email: "testuser@taskflow.dev",
    password: "Password123!",
    name: "Test User",
  };

  let accessToken: string;
  let refreshTokenCookie: string;

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user and set HttpOnly refresh token cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=/);
      refreshTokenCookie = cookies[0];
    });

    it("should return 409 Conflict if email is already registered", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("CONFLICT");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should successfully log in and return access token", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
    });

    it("should fail login with invalid password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "WrongPassword123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return current user profile when valid Bearer token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it("should return 401 Unauthorized if Bearer token is missing", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});