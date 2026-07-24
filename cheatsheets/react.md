# React & Vite Core Setup & Comprehensive Reference Cheatsheet

A complete, production-ready guide covering initial project setup through advanced React patterns, state management, routing, drag-and-drop, and performance optimization.

---

## 1. Quick Start & Project Boilerplate Setup

### Step 1: Initialize Project with Vite & TypeScript
Run in your terminal:
```bash
mkdir projects/01-task-manager-react
cd projects/01-task-manager-react
npx -y create-vite@latest . --template react-ts
```

### Step 2: Install Core Dependencies & Tailwind CSS v4
```bash
# Core Application Dependencies
npm install react react-dom react-router-dom @tanstack/react-query zustand lucide-react @hello-pangea/dnd clsx tailwind-merge

# Tailwind CSS v4, Types & Tooling
npm install -D tailwindcss @tailwindcss/vite @types/node @types/react @types/react-dom eslint typescript vite
```

### Step 3: Configure Vite & TypeScript Path Aliases (`@/`)

Update `vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Update `tsconfig.app.json` (inside `compilerOptions`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Update `src/index.css` (Tailwind CSS v4 & Dark Variant):
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200 antialiased;
  }
}

/* Glassmorphism panel utility */
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### Step 4: Configure Modern ESLint Flat Config (`eslint.config.js`)
```javascript
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
```

---

## 2. Core React Features & Hooks Guide

### A. React Built-in Hooks Summary

| Hook | Primary Use Case | Example Snippet |
| --- | --- | --- |
| `useState` | Local component state | `const [count, setCount] = useState<number>(0);` |
| `useEffect` | Side effects & lifecycle events | `useEffect(() => { fetchTask(); }, [taskId]);` |
| `useContext` | Read context values | `const theme = useContext(ThemeContext);` |
| `useReducer` | Complex state transitions | `const [state, dispatch] = useReducer(taskReducer, initialState);` |
| `useRef` | DOM references & mutable values without re-render | `const inputRef = useRef<HTMLInputElement>(null);` |
| `useMemo` | Memoize expensive calculations | `const sortedTasks = useMemo(() => tasks.sort(), [tasks]);` |
| `useCallback` | Memoize function instance across renders | `const handleToggle = useCallback((id) => toggle(id), []);` |
| `useId` | Generate unique accessible IDs | `const id = useId();` |

---

### B. Client Routing (`react-router-dom` v7 / v6)

```tsx
import { BrowserRouter, Routes, Route, NavLink, useParams, useNavigate, useSearchParams } from 'react-router-dom';

function AppNavigation() {
  return (
    <BrowserRouter>
      <header className="glass-panel sticky top-0 z-40 p-4 border-b">
        <nav className="flex gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`
            }
          >
            Board
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`
            }
          >
            List
          </NavLink>
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<BoardView />} />
          <Route path="/tasks" element={<TaskListView />} />
          <Route path="/tasks/:id" element={<TaskDetailView />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// Reading Parameters & Navigating Programmatically:
function TaskDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div>
      <h2>Task Detail: {id}</h2>
      <button onClick={() => navigate(-1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded">
        Back
      </button>
    </div>
  );
}
```

---

### C. State Management: Context API & Zustand

#### 1. Theme Context API (with Fast Refresh Directive)
```tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme");
    return saved === "light" || saved === "dark"
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

#### 2. Zustand Store (Persistent Local Storage Store)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (newTask) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...newTask,
              id: `task-${crypto.randomUUID()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "task-manager-zustand-store",
    }
  )
);
```

---

### D. Drag & Drop Integration (`@hello-pangea/dnd`)

```tsx
import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';

export const KanbanBoard: React.FC = () => {
  const { tasks, updateTaskStatus } = useTaskStore();

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    updateTaskStatus(draggableId, destination.droppableId as any);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {['todo', 'in_progress', 'completed'].map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded-xl border ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}
              >
                <h3 className="font-bold mb-3 uppercase text-xs">{status}</h3>
                {tasks.filter((t) => t.status === status).map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(providedDrag) => (
                      <div
                        ref={providedDrag.innerRef}
                        {...providedDrag.draggableProps}
                        {...providedDrag.dragHandleProps}
                        className="p-3 mb-2 bg-slate-100 dark:bg-slate-800 rounded-lg border shadow-xs"
                      >
                        {task.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};
```

---

### E. Server State & Data Fetching (TanStack React Query v5)

```tsx
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function ReactQueryWrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function useTasksQuery() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<Task[]>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale time
  });
}
```

---

### F. Advanced React Patterns & Error Boundaries

#### 1. React Portals (Modals & Dialog Overlays)
```tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
```

#### 2. Class-Based Error Boundary
```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 max-w-md text-center">
            <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Application Error</h2>
            <p className="text-xs text-rose-300 font-mono bg-rose-950/40 p-3 rounded mb-4 overflow-auto">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 3. Best Practices & Optimization Checklist
- [x] Use **TypeScript** for strict type checking on props, stores, and custom hooks.
- [x] Configure path aliases (`@/*`) in both `vite.config.ts` and `tsconfig.app.json`.
- [x] Wrap dynamic route components with `lazy()` and `<Suspense fallback={<Spinner />}>`.
- [x] Add `/* eslint-disable react-refresh/only-export-components */` on Context files exporting both Context Provider and custom hook `useContext`.
- [x] Prefer **Zustand** with `persist` middleware for transient UI/global state and **React Query** for server-synced data.
- [x] Ensure all drag-and-drop lists use unique, stable keys (`key={task.id}`) and valid droppable IDs.
