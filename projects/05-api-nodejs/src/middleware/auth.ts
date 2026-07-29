import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { AppError } from "../utils/appError";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        401,
        "UNAUTHORIZED",
        "Access token missing or invalid format"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new AppError(401, "UNAUTHORIZED", "Invalid or expired access token")
    );
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to access this resource"
        )
      );
    }

    next();
  };
};