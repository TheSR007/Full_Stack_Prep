"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  CircleAlert,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  History,
  Layers,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskPriority, TaskStatus } from "@/types/task";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tasks, updateTaskStatus, toggleSubtask, deleteTask, openEditModal } = useTaskStore();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <CircleAlert className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">Task Not Found</h2>
        <p className="text-xs text-slate-500">The task ID "{id}" could not be located in store.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Board
        </Link>
      </div>
    );
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">URGENT PRIORITY</span>;
      case "high":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">HIGH PRIORITY</span>;
      case "medium":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">MEDIUM PRIORITY</span>;
      case "low":
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">LOW PRIORITY</span>;
    }
  };

  const getStatusPill = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> In Progress
          </span>
        );
      case "todo":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <CircleAlert className="w-3.5 h-3.5 text-amber-500" /> To Do
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Previous Page
      </Link>

      {/* Main Task Detail Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-6">
        {/* Header Title & Category */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                {task.category || "General"}
              </span>
              {getStatusPill(task.status)}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-slate-50/80 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Metadata Grid (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Priority Level</span>
            <div>{getPriorityBadge(task.priority)}</div>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Due Date</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {task.dueDate || "Not set"}
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Created Date</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {task.tags && task.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Associated Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Tag className="w-3 h-3 text-indigo-500" />#{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sub-tasks Checklist */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sub-tasks Checklist ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <button
                  key={st.id}
                  onClick={() => toggleSubtask(task.id, st.id)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-left hover:border-indigo-500/40 transition-colors"
                >
                  {st.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      st.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {st.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timestamp Log */}
        {task.history && task.history.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-500" /> Activity History Log
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {task.history.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg text-slate-600 dark:text-slate-400"
                >
                  <span>{log.text}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Status Switcher */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" /> Quick Status Switcher:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateTaskStatus(task.id, "todo")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                task.status === "todo"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => updateTaskStatus(task.id, "in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                task.status === "in_progress"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => updateTaskStatus(task.id, "completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                task.status === "completed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
