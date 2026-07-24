import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    LayoutGrid,
    List,
    BarChart3,
    Settings as SettingsIcon,
    Plus,
    Search,
    Moon,
    Sun,
} from "lucide-react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TaskFormModal } from "./components/TaskFormModal";
import { useTaskStore } from "./store/useTaskStore";
import type { Task } from "./types/task";

// Lazy loading route components for Suspense code splitting
const KanbanBoard = lazy(() =>
    import("./routes/KanbanBoard").then(m => ({ default: m.KanbanBoard })),
);
const TaskList = lazy(() =>
    import("./routes/TaskList").then(m => ({ default: m.TaskList })),
);
const TaskDetail = lazy(() =>
    import("./routes/TaskDetail").then(m => ({ default: m.TaskDetail })),
);
const Analytics = lazy(() =>
    import("./routes/Analytics").then(m => ({ default: m.Analytics })),
);
const Settings = lazy(() =>
    import("./routes/Settings").then(m => ({ default: m.Settings })),
);

const queryClient = new QueryClient();

const NavigationHeader: React.FC<{
    onOpenCreate: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}> = ({ onOpenCreate, searchQuery, setSearchQuery }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="border-b border-slate-200/80 dark:border-slate-800/80 glass-panel sticky top-0 z-40 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <NavLink
                        to="/"
                        className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                            TM
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                            TaskFlow
                        </span>
                    </NavLink>

                    <nav className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                                    isActive
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`
                            }>
                            <LayoutGrid className="w-3.5 h-3.5" /> Board
                        </NavLink>
                        <NavLink
                            to="/tasks"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                                    isActive
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`
                            }>
                            <List className="w-3.5 h-3.5" /> List
                        </NavLink>
                        <NavLink
                            to="/analytics"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                                    isActive
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`
                            }>
                            <BarChart3 className="w-3.5 h-3.5" /> Analytics
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                                    isActive
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`
                            }>
                            <SettingsIcon className="w-3.5 h-3.5" /> Settings
                        </NavLink>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 w-40 sm:w-56 transition-all"
                        />
                    </div>

                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 hover:border-indigo-500/30 transition-all duration-200 shadow-xs">
                        {theme === "dark" ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-600" />
                        )}
                    </button>

                    <button
                        onClick={onOpenCreate}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all duration-150">
                        <Plus className="w-4 h-4" /> New Task
                    </button>
                </div>
            </div>
        </header>
    );
};

export function MainApp() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");

    const addTask = useTaskStore(state => state.addTask);
    const updateTask = useTaskStore(state => state.updateTask);

    const handleOpenCreate = () => {
        setEditingTask(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (taskData: Omit<Task, "id" | "createdAt">) => {
        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }
    };

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
                <NavigationHeader
                    onOpenCreate={handleOpenCreate}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-mono">
                                Loading route component...
                            </div>
                        }>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <KanbanBoard
                                        onOpenCreateModal={handleOpenCreate}
                                        searchQuery={searchQuery}
                                    />
                                }
                            />
                            <Route
                                path="/tasks"
                                element={
                                    <TaskList
                                        onEditTask={handleOpenEdit}
                                        searchQuery={searchQuery}
                                    />
                                }
                            />
                            <Route
                                path="/tasks/:id"
                                element={<TaskDetail />}
                            />
                            <Route
                                path="/analytics"
                                element={<Analytics />}
                            />
                            <Route
                                path="/settings"
                                element={<Settings />}
                            />
                        </Routes>
                    </Suspense>
                </main>

                <TaskFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialTask={editingTask}
                />
            </div>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <MainApp />
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}