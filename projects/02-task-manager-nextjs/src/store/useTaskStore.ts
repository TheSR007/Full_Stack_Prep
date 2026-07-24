import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus, TaskPriority, FilterState, ToastMessage, SubTask, ActivityLog } from "@/types/task";

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Configure Next.js App Router & Server Actions",
    description: "Structure route components, layout hierarchy, and server action mutation endpoints for TaskFlow.",
    status: "in_progress",
    priority: "urgent",
    category: "Frontend",
    tags: ["Next.js", "App Router", "SSR"],
    dueDate: "2026-07-30",
    createdAt: "2026-07-24T10:00:00.000Z",
    subtasks: [
      { id: "sub-1", title: "Set up Server Actions in taskActions.ts", completed: true },
      { id: "sub-2", title: "Connect Zustand persistent store", completed: true },
      { id: "sub-3", title: "Implement revalidatePath cache clearing", completed: false },
    ],
    history: [
      { id: "hist-1", text: "Task created with urgent priority", timestamp: "2026-07-24T10:00:00.000Z" },
      { id: "hist-2", text: "Status changed to In Progress", timestamp: "2026-07-24T11:30:00.000Z" },
    ],
  },
  {
    id: "task-2",
    title: "Implement Dark & Light Theme Glassmorphism",
    description: "Ensure Tailwind v4 glassmorphism utilities and smooth theme transitions matching DESIGN.md.",
    status: "todo",
    priority: "high",
    category: "Styling",
    tags: ["Tailwind", "CSS", "Theme"],
    dueDate: "2026-07-28",
    createdAt: "2026-07-24T12:00:00.000Z",
    subtasks: [
      { id: "sub-4", title: "Configure .glass-panel backdrop blur", completed: true },
      { id: "sub-5", title: "Test light mode contrast ratio >= 4.5:1", completed: false },
    ],
    history: [
      { id: "hist-3", text: "Task created", timestamp: "2026-07-24T12:00:00.000Z" },
    ],
  },
  {
    id: "task-3",
    title: "Build Multi-Field Search & Highlight Engine",
    description: "Enable live filtering across task titles, descriptions, and tags with visual search term matching.",
    status: "completed",
    priority: "medium",
    category: "Search",
    tags: ["Search", "UX", "Filter"],
    dueDate: "2026-07-25",
    createdAt: "2026-07-23T14:00:00.000Z",
    subtasks: [
      { id: "sub-6", title: "Implement case-insensitive text matching", completed: true },
      { id: "sub-7", title: "Add keyboard shortcut '/' to focus search", completed: true },
    ],
    history: [
      { id: "hist-4", text: "Task marked as completed", timestamp: "2026-07-24T16:00:00.000Z" },
    ],
  },
];

interface TaskStore {
  tasks: Task[];
  filters: FilterState;
  selectedTaskIds: string[];
  toasts: ToastMessage[];
  isModalOpen: boolean;
  editingTask: Task | null;
  
  // Actions
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;
  resetStore: () => void;
  
  // Bulk Operations
  toggleSelectTask: (id: string) => void;
  selectAllTasks: (ids: string[]) => void;
  clearSelectedTasks: () => void;
  bulkUpdateStatus: (status: TaskStatus) => void;
  bulkDeleteTasks: () => void;
  
  // Modals & Toasts
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
  addToast: (type: ToastMessage["type"], text: string) => void;
  removeToast: (id: string) => void;
  
  // Export / Import
  exportJSON: () => string;
  exportCSV: () => string;
  importJSON: (jsonString: string) => boolean;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: INITIAL_TASKS,
      filters: {
        priority: "all",
        category: "all",
        sortBy: "createdAt",
        search: "",
      },
      selectedTaskIds: [],
      toasts: [],
      isModalOpen: false,
      editingTask: null,

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () =>
        set({
          filters: {
            priority: "all",
            category: "all",
            sortBy: "createdAt",
            search: "",
          },
        }),

      addTask: (newTask) => {
        const id = `task-${crypto.randomUUID()}`;
        const timestamp = new Date().toISOString();
        const createdTask: Task = {
          ...newTask,
          id,
          createdAt: timestamp,
          subtasks: newTask.subtasks || [],
          history: [
            {
              id: `hist-${crypto.randomUUID()}`,
              text: "Task created",
              timestamp,
            },
          ],
        };

        set((state) => ({
          tasks: [createdTask, ...state.tasks],
        }));
        get().addToast("success", `Created task: "${createdTask.title}"`);
      },

      updateTask: (id, updates) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const updatedHistory = [
              ...(task.history || []),
              {
                id: `hist-${crypto.randomUUID()}`,
                text: "Task details updated",
                timestamp,
              },
            ];
            return { ...task, ...updates, history: updatedHistory };
          }),
        }));
        get().addToast("info", "Task updated successfully");
      },

      updateTaskStatus: (id, status) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const updatedHistory = [
              ...(task.history || []),
              {
                id: `hist-${crypto.randomUUID()}`,
                text: `Status changed to ${status.replace("_", " ")}`,
                timestamp,
              },
            ];
            return { ...task, status, history: updatedHistory };
          }),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const updatedSubtasks = (task.subtasks || []).map((sub) =>
              sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            );
            return { ...task, subtasks: updatedSubtasks };
          }),
        }));
      },

      deleteTask: (id) => {
        const target = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskIds: state.selectedTaskIds.filter((sid) => sid !== id),
        }));
        if (target) {
          get().addToast("warning", `Deleted task: "${target.title}"`);
        }
      },

      resetStore: () => {
        set({
          tasks: INITIAL_TASKS,
          selectedTaskIds: [],
          filters: {
            priority: "all",
            category: "all",
            sortBy: "createdAt",
            search: "",
          },
        });
        get().addToast("info", "Task store reset to default seed data");
      },

      toggleSelectTask: (id) =>
        set((state) => ({
          selectedTaskIds: state.selectedTaskIds.includes(id)
            ? state.selectedTaskIds.filter((item) => item !== id)
            : [...state.selectedTaskIds, id],
        })),

      selectAllTasks: (ids) => set({ selectedTaskIds: ids }),
      clearSelectedTasks: () => set({ selectedTaskIds: [] }),

      bulkUpdateStatus: (status) => {
        const selected = get().selectedTaskIds;
        if (selected.length === 0) return;
        const timestamp = new Date().toISOString();

        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (!selected.includes(task.id)) return task;
            const updatedHistory = [
              ...(task.history || []),
              {
                id: `hist-${crypto.randomUUID()}`,
                text: `Bulk updated status to ${status.replace("_", " ")}`,
                timestamp,
              },
            ];
            return { ...task, status, history: updatedHistory };
          }),
          selectedTaskIds: [],
        }));
        get().addToast("success", `Updated ${selected.length} tasks to ${status.replace("_", " ")}`);
      },

      bulkDeleteTasks: () => {
        const selected = get().selectedTaskIds;
        if (selected.length === 0) return;
        set((state) => ({
          tasks: state.tasks.filter((task) => !selected.includes(task.id)),
          selectedTaskIds: [],
        }));
        get().addToast("warning", `Bulk deleted ${selected.length} tasks`);
      },

      openCreateModal: () => set({ isModalOpen: true, editingTask: null }),
      openEditModal: (task) => set({ isModalOpen: true, editingTask: task }),
      closeModal: () => set({ isModalOpen: false, editingTask: null }),

      addToast: (type, text) => {
        const id = `toast-${crypto.randomUUID()}`;
        set((state) => ({
          toasts: [...state.toasts, { id, type, text }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      exportJSON: () => JSON.stringify(get().tasks, null, 2),

      exportCSV: () => {
        const tasks = get().tasks;
        const headers = ["ID", "Title", "Status", "Priority", "Category", "Due Date", "Created At"];
        const rows = tasks.map((t) => [
          t.id,
          `"${t.title.replace(/"/g, '""')}"`,
          t.status,
          t.priority,
          t.category,
          t.dueDate,
          t.createdAt,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      },

      importJSON: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
            set({ tasks: parsed });
            get().addToast("success", `Imported ${parsed.length} tasks successfully`);
            return true;
          }
          return false;
        } catch {
          get().addToast("error", "Invalid JSON format for task import");
          return false;
        }
      },
    }),
    {
      name: "task-manager-nextjs-store-v2",
    }
  )
);
