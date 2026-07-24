export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: string;
    tags: string[];
    dueDate: string;
    createdAt: string;
}

export interface TaskFilterState {
    search: string;
    status: TaskStatus | "all";
    priority: TaskPriority | "all";
    category: string | "all";
    sortBy: "createdAt" | "dueDate" | "priority";
    sortOrder: "asc" | "desc";
}
