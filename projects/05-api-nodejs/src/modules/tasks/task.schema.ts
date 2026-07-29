import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().default(""),
    status: z.enum(["todo", "in_progress", "completed"]).optional().default("todo"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
    category: z.string().optional().default("General"),
    tags: z.array(z.string()).optional().default([]),
    dueDate: z.string().min(1, "Due date is required"),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Task ID format"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Task ID format"),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
    sortBy: z.enum(["createdAt", "dueDate", "priorityWeight", "title"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid()).min(1, "At least one taskId is required"),
  }),
});

export const bulkUpdateStatusSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid()).min(1, "At least one taskId is required"),
    status: z.enum(["todo", "in_progress", "completed"]),
  }),
});

export const createSubtaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Task ID format"),
  }),
  body: z.object({
    title: z.string().min(1, "Subtask title is required"),
  }),
});

export const updateSubtaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Task ID format"),
    subtaskId: z.string().uuid("Invalid Subtask ID format"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    completed: z.boolean().optional(),
  }),
});