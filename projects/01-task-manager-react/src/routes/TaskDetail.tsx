import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import {
    ArrowLeft,
    Calendar,
    Tag,
    AlertCircle,
    Clock,
    CheckCircle2,
    CircleAlert,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useCustomHooks";

export const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const task = useTaskStore(state => state.tasks.find(t => t.id === id));
    const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);

    useDocumentTitle(task ? `Task: ${task.title}` : "Task Details");

    if (!task) {
        return (
            <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl transition-all duration-200">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Task Not Found
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    The requested task ID{" "}
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {id}
                    </code>{" "}
                    could not be found.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const getStatusBadge = () => {
        switch (task.status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="w-4 h-4" /> In Progress
                    </span>
                );
            case "todo":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <CircleAlert className="w-4 h-4" /> To Do
                    </span>
                );
        }
    };

    const getPriorityBadge = () => {
        switch (task.priority) {
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
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-md transition-all duration-200">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition mb-6 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-150" />{" "}
                Back to Previous Page
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">
                        {task.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">
                        {task.title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge()}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Task Description
                    </h3>
                    <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 rounded-xl p-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        {task.description ||
                            "No detailed description provided."}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-1">
                            Priority Level
                        </span>
                        <span
                            className={`text-xs uppercase tracking-wider font-extrabold px-2.5 py-1 border rounded-md inline-block ${getPriorityBadge()}`}>
                            {task.priority}
                        </span>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-1">
                            Target Due Date
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            {task.dueDate}
                        </div>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-1">
                            Created On
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Associated Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {task.tags.map(tag => (
                            <span
                                key={tag}
                                className="bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                                <Tag className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Quick Status Switch:
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateTaskStatus(task.id, "todo")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                task.status === "todo"
                                    ? "bg-amber-500 text-white border-amber-600"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                            To Do
                        </button>
                        <button
                            onClick={() =>
                                updateTaskStatus(task.id, "in_progress")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                task.status === "in_progress"
                                    ? "bg-blue-600 text-white border-blue-700"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                            In Progress
                        </button>
                        <button
                            onClick={() =>
                                updateTaskStatus(task.id, "completed")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                task.status === "completed"
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                            Completed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
