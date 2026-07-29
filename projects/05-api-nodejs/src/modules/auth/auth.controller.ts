import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await AuthService.register(req.body);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
      });

      return res.status(201).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await AuthService.login(req.body);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
      });

      return res.status(200).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const { accessToken } = await AuthService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await AuthService.logout(refreshToken);

      res.clearCookie("refreshToken", {
        path: "/api/v1/auth",
      });

      return res.status(200).json({
        success: true,
        data: {
          message: "Successfully logged out",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}