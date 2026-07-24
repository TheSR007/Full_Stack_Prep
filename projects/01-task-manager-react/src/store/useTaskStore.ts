import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus } from "../types/task";

interface TaskStore {
    tasks: Task[];
    addTask: (task: Omit<Task, "id" | "createdAt">) => void;
    updateTask: (id: string, updatedFields: Partial<Task>) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    deleteTask: (id: string) => void;
    reorderTasks: (newTasks: Task[]) => void;
}

const initialMockTasks: Task[] = [
    {
        id: "task-1",
        title: "Setup React Router v6 & Zustand Store",
        description:
            "Configure multi-page client routing and persistent local state management.",
        status: "completed",
        priority: "high",
        category: "Engineering",
        tags: ["React", "Zustand"],
        dueDate: "2026-07-25",
        createdAt: "2026-07-24T10:00:00Z",
    },
    {
        id: "task-2",
        title: "Implement Portals Modal for Task Form",
        description:
            "Build React createPortal overlay component for accessible dialog rendering.",
        status: "in_progress",
        priority: "urgent",
        category: "UI/UX",
        tags: ["Portals", "Tailwind"],
        dueDate: "2026-07-26",
        createdAt: "2026-07-24T11:00:00Z",
    },
    {
        id: "task-3",
        title: "Setup TanStack React Query Cache Layer",
        description:
            "Integrate mock query handlers and mutation state for task status changes.",
        status: "todo",
        priority: "medium",
        category: "Engineering",
        tags: ["ReactQuery", "API"],
        dueDate: "2026-07-28",
        createdAt: "2026-07-24T12:00:00Z",
    },
];

export const useTaskStore = create<TaskStore>()(
    persist(
        set => ({
            tasks: initialMockTasks,
            addTask: newTask =>
                set(state => ({
                    tasks: [
                        ...state.tasks,
                        {
                            ...newTask,
                            id: `task-${crypto.randomUUID()}`,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),
            updateTask: (id, updatedFields) =>
                set(state => ({
                    tasks: state.tasks.map(task =>
                        task.id === id ? { ...task, ...updatedFields } : task,
                    ),
                })),
            updateTaskStatus: (id, status) =>
                set(state => ({
                    tasks: state.tasks.map(task =>
                        task.id === id ? { ...task, status } : task,
                    ),
                })),
            deleteTask: id =>
                set(state => ({
                    tasks: state.tasks.filter(task => task.id !== id),
                })),
            reorderTasks: newTasks => set({ tasks: newTasks }),
        }),
        {
            name: "task-manager-zustand-store",
        },
    ),
);
