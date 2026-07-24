import React, { useState } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { Link } from "react-router-dom";
import {
    Trash2,
    Edit3,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    CircleAlert,
    Inbox,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useCustomHooks";
import type { Task, TaskPriority, TaskStatus } from "../types/task";

interface TaskListProps {
    onEditTask: (task: Task) => void;
    searchQuery: string;
}

export const TaskList: React.FC<TaskListProps> = ({
    onEditTask,
    searchQuery,
}) => {
    useDocumentTitle("Task List View");
    const { tasks, deleteTask, updateTaskStatus } = useTaskStore();
    const [sortField, setSortField] = useState<
        "title" | "dueDate" | "priority"
    >("dueDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const filteredTasks = tasks.filter(
        t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (sortOrder === "desc") {
            return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });

    const toggleSort = (field: "title" | "dueDate" | "priority") => {
        if (sortField === field) {
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                    </span>
                );
            case "todo":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <CircleAlert className="w-3.5 h-3.5" /> To Do
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: TaskPriority) => {
        switch (priority) {
            case "urgent":
                return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
            case "high":
                return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
            case "medium":
                return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
            case "low":
            default:
                return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
        }
    };

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
            {/* Table Header Info Bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                        All Tasks
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Showing {sortedTasks.length}{" "}
                        {sortedTasks.length === 1 ? "task" : "tasks"}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100/60 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                            <th
                                className="px-6 py-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                onClick={() => toggleSort("title")}>
                                <div className="flex items-center gap-1.5">
                                    Task Title{" "}
                                    <ArrowUpDown
                                        className={`w-3 h-3 ${sortField === "title" ? "text-indigo-600" : ""}`}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-3.5">Status</th>
                            <th
                                className="px-6 py-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                onClick={() => toggleSort("priority")}>
                                <div className="flex items-center gap-1.5">
                                    Priority{" "}
                                    <ArrowUpDown
                                        className={`w-3 h-3 ${sortField === "priority" ? "text-indigo-600" : ""}`}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-3.5">Category</th>
                            <th
                                className="px-6 py-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                onClick={() => toggleSort("dueDate")}>
                                <div className="flex items-center gap-1.5">
                                    Due Date{" "}
                                    <ArrowUpDown
                                        className={`w-3 h-3 ${sortField === "dueDate" ? "text-indigo-600" : ""}`}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm text-slate-800 dark:text-slate-200">
                        {sortedTasks.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">
                                        No tasks found matching query.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            sortedTasks.map(task => (
                                <tr
                                    key={task.id}
                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150">
                                    <td className="px-6 py-4 font-semibold">
                                        <Link
                                            to={`/tasks/${task.id}`}
                                            className="text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                            {task.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(task.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 border rounded-md ${getPriorityBadge(
                                                task.priority,
                                            )}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium">
                                            {task.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                        {task.dueDate}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() =>
                                                updateTaskStatus(
                                                    task.id,
                                                    task.status === "completed"
                                                        ? "todo"
                                                        : "completed",
                                                )
                                            }
                                            title="Toggle Complete"
                                            className={`p-1.5 rounded-lg transition ${
                                                task.status === "completed"
                                                    ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                    : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}>
                                            <CheckCircle2 className="w-4 h-4 inline" />
                                        </button>
                                        <button
                                            onClick={() => onEditTask(task)}
                                            title="Edit Task"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                            <Edit3 className="w-4 h-4 inline" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            title="Delete Task"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
