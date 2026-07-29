import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/task.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import { setupSwagger } from "./docs/swagger";

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
app.use(morgan(":method :url :status :res[content-length] - :response-time ms", { stream: morganStream }));

// Rate Limiter for API endpoints
app.use("/api", apiLimiter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "pass",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger API Documentation
setupSwagger(app);

// Application Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;