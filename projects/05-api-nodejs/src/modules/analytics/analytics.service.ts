import prisma from "../../utils/prisma";

export class AnalyticsService {
  static async getAnalytics(userId: string, userRole: string) {
    const where: any = {};
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress").length;
    const urgentTasks = tasks.filter((t: any) => t.priority === "urgent").length;

    const completionRate = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2)) : 0;

    const priorityDistribution = {
      low: tasks.filter((t: any) => t.priority === "low").length,
      medium: tasks.filter((t: any) => t.priority === "medium").length,
      high: tasks.filter((t: any) => t.priority === "high").length,
      urgent: urgentTasks,
    };

    // Calculate completion velocity (tasks completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completedThisWeek = tasks.filter(
      (t: any) => t.status === "completed" && new Date(t.updatedAt) >= sevenDaysAgo
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      urgentTasks,
      completionRate,
      velocity: {
        completedThisWeek,
        trend: "up",
      },
      priorityDistribution,
    };
  }
}