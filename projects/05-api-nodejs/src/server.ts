import app from "./app";
import { config } from "./config/config";
import logger from "./utils/logger";
import prisma from "./utils/prisma";

const server = app.listen(config.PORT, () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`);
  logger.info(`OpenAPI Swagger documentation available at http://localhost:${config.PORT}/api-docs`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received: closing HTTP server...`);
  server.close(async () => {
    logger.info("HTTP server closed. Disconnecting database client...");
    await prisma.$disconnect();
    logger.info("Database client disconnected. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));