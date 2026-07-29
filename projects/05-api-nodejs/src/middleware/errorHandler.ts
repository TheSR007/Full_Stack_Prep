import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    });
  }

  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};