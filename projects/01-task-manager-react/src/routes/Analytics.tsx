import React from "react";
import { useTaskStore } from "../store/useTaskStore";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    ListTodo,
    TrendingUp,
    Layers,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useCustomHooks";

export const Analytics: React.FC = () => {
    useDocumentTitle("Analytics & Task Metrics");
    const tasks = useTaskStore(state => state.tasks);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const urgent = tasks.filter(t => t.priority === "urgent").length;
    const high = tasks.filter(t => t.priority === "high").length;
    const medium = tasks.filter(t => t.priority === "medium").length;
    const low = tasks.filter(t => t.priority === "low").length;

    const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Analytics & Task Metrics
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Real-time overview of workload distribution, completion
                        velocity, and priority levels.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-500/20 w-fit">
                    <TrendingUp className="w-4 h-4" />
                    <span>{completionRate}% Complete</span>
                </div>
            </div>

            {/* Primary Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 shadow-2xs">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                            Total Tasks
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                            {total}
                        </h2>
                    </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shadow-2xs">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                            Completed
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                            {completed}
                        </h2>
                    </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20 shadow-2xs">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                            In Progress
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                            {inProgress}
                        </h2>
                    </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 shadow-2xs">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                            Urgent Tasks
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                            {urgent}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Progress & Priority Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />{" "}
                            Overall Completion Rate
                        </h3>
                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {completionRate}%
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                        <div
                            className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>
                            Completed:{" "}
                            <strong className="text-slate-800 dark:text-slate-200">
                                {completed}
                            </strong>
                        </span>
                        <span>
                            Pending:{" "}
                            <strong className="text-slate-800 dark:text-slate-200">
                                {todo + inProgress}
                            </strong>
                        </span>
                    </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-indigo-500" /> Priority
                        Distribution
                    </h3>

                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-rose-600 dark:text-rose-400">
                                Urgent ({urgent})
                            </span>
                            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${total > 0 ? (urgent / total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                High ({high})
                            </span>
                            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${total > 0 ? (high / total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sky-600 dark:text-sky-400">
                                Medium ({medium})
                            </span>
                            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${total > 0 ? (medium / total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                Low ({low})
                            </span>
                            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-slate-400 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${total > 0 ? (low / total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
