import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const analytics = await AnalyticsService.getAnalytics(userId, userRole);

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}