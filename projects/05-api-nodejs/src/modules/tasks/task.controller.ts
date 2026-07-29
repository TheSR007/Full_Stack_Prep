import { Request, Response, NextFunction } from "express";
import { TaskService } from "./task.service";

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await TaskService.getTasks(userId, userRole, req.query as any);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const task = await TaskService.getTaskById(req.params.id as string, userId, userRole);

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const task = await TaskService.createTask(userId, req.body);

      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const task = await TaskService.updateTask(req.params.id as string, userId, userRole, req.body);

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await TaskService.deleteTask(req.params.id as string, userId, userRole);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await TaskService.bulkDelete(req.body.taskIds, userId, userRole);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await TaskService.bulkUpdateStatus(req.body.taskIds, req.body.status, userId, userRole);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const categories = await TaskService.getCategories(userId, userRole);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const subtask = await TaskService.createSubtask(req.params.id as string, userId, userRole, req.body.title);

      return res.status(201).json({
        success: true,
        data: subtask,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const subtask = await TaskService.updateSubtask(req.params.id as string, req.params.subtaskId as string, userId, userRole, req.body);

      return res.status(200).json({
        success: true,
        data: subtask,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await TaskService.deleteSubtask(req.params.id as string, req.params.subtaskId as string, userId, userRole);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
