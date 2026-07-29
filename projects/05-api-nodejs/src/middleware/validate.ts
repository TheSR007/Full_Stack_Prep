import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { AppError } from "../utils/appError";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join(".").replace(/^(body|query|params)\./, ""),
          message: err.message,
        }));
        next(
          new AppError(
            400,
            "VALIDATION_ERROR",
            "Invalid request parameters",
            formattedErrors
          )
        );
      } else {
        next(error);
      }
    }
  };
};