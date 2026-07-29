import prisma from "../../utils/prisma";
import { AppError } from "../../utils/appError";

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export class TaskService {
  static async getTasks(userId: string, userRole: string, query: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    // RBAC: Standard user sees only own tasks, Admin sees all
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    if (query.priority && query.priority !== "all") {
      where.priority = query.priority;
    }

    if (query.category && query.category !== "all") {
      where.category = {
        equals: query.category,
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { tags: { contains: query.search } },
      ];
    }

    if (query.tag) {
      where.tags = { contains: query.tag };
    }

    let orderBy: any = {};
    const sortOrder = query.sortOrder || "desc";

    if (query.sortBy === "title") {
      orderBy = { title: sortOrder };
    } else if (query.sortBy === "dueDate") {
      orderBy = { dueDate: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          subtasks: true,
          history: {
            orderBy: { timestamp: "desc" },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Parse JSON tags string to array
    const formattedTasks = tasks.map((task: any) => {
      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(task.tags);
      } catch (e) {
        parsedTags = [];
      }
      return {
        ...task,
        tags: parsedTags,
      };
    });

    // In-memory sort fallback for priorityWeight if requested
    if (query.sortBy === "priorityWeight") {
      formattedTasks.sort((a: any, b: any) => {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
        return sortOrder === "asc" ? weightA - weightB : weightB - weightA;
      });
    }

    return {
      data: formattedTasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getTaskById(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        subtasks: true,
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!task) {
      throw new AppError(404, "NOT_FOUND", "Task not found");
    }

    if (userRole !== "ADMIN" && task.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this task");
    }

    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(task.tags);
    } catch (e) {
      parsedTags = [];
    }

    return {
      ...task,
      tags: parsedTags,
    };
  }

  static async createTask(userId: string, data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    tags?: string[];
    dueDate: string;
  }) {
    const tagsString = JSON.stringify(data.tags || []);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || "",
        status: data.status || "todo",
        priority: data.priority || "medium",
        category: data.category || "General",
        tags: tagsString,
        dueDate: data.dueDate,
        userId,
        history: {
          create: {
            text: "Task created",
          },
        },
      },
      include: {
        subtasks: true,
        history: true,
      },
    });

    return {
      ...task,
      tags: data.tags || [],
    };
  }

  static async updateTask(taskId: string, userId: string, userRole: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    tags?: string[];
    dueDate?: string;
  }) {
    const existingTask = await this.getTaskById(taskId, userId, userRole);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

    // Track status change in activity log
    const historyCreate = data.status && data.status !== existingTask.status
      ? { create: { text: `Status updated to ${data.status}` } }
      : undefined;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        history: historyCreate,
      },
      include: {
        subtasks: true,
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(updatedTask.tags);
    } catch (e) {
      parsedTags = [];
    }

    return {
      ...updatedTask,
      tags: parsedTags,
    };
  }

  static async deleteTask(taskId: string, userId: string, userRole: string) {
    await this.getTaskById(taskId, userId, userRole);

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId, message: "Task deleted successfully" };
  }

  static async bulkDelete(taskIds: string[], userId: string, userRole: string) {
    const where: any = { id: { in: taskIds } };
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    const result = await prisma.task.deleteMany({ where });

    return {
      count: result.count,
      message: `${result.count} tasks deleted successfully`,
    };
  }

  static async bulkUpdateStatus(taskIds: string[], status: string, userId: string, userRole: string) {
    const where: any = { id: { in: taskIds } };
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    const result = await prisma.task.updateMany({
      where,
      data: { status },
    });

    return {
      count: result.count,
      message: `${result.count} tasks updated to ${status} status`,
    };
  }

  static async getCategories(userId: string, userRole: string) {
    const where: any = {};
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      select: { category: true },
    });

    const categorySet = new Set<string>();
    tasks.forEach((t: any) => {
      if (t.category) {
        categorySet.add(t.category);
      }
    });

    const categories = Array.from(categorySet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return categories;
  }

  static async createSubtask(taskId: string, userId: string, userRole: string, title: string) {
    await this.getTaskById(taskId, userId, userRole);

    const subtask = await prisma.subTask.create({
      data: {
        taskId,
        title,
        completed: false,
      },
    });

    return subtask;
  }

  static async updateSubtask(taskId: string, subtaskId: string, userId: string, userRole: string, data: { title?: string; completed?: boolean }) {
    await this.getTaskById(taskId, userId, userRole);

    const subtask = await prisma.subTask.update({
      where: { id: subtaskId },
      data,
    });

    return subtask;
  }

  static async deleteSubtask(taskId: string, subtaskId: string, userId: string, userRole: string) {
    await this.getTaskById(taskId, userId, userRole);

    await prisma.subTask.delete({
      where: { id: subtaskId },
    });

    return { id: subtaskId, message: "Subtask deleted successfully" };
  }
}
