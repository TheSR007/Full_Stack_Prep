export type TaskStatus = "todo" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
}

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
  subtasks?: SubTask[];
  history?: ActivityLog[];
}

export interface FilterState {
  priority: string;
  category: string;
  sortBy: "createdAt" | "dueDate" | "priorityWeight" | "title";
  search: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
}
