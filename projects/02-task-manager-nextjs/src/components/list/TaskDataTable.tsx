"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Clock,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export function TaskDataTable() {
  const {
    tasks,
    filters,
    setFilter,
    selectedTaskIds,
    toggleSelectTask,
    selectAllTasks,
    clearSelectedTasks,
    bulkUpdateStatus,
    bulkDeleteTasks,
    updateTaskStatus,
    deleteTask,
    openEditModal,
  } = useTaskStore();

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filters.priority !== "all" && task.priority !== filters.priority) return false;
        if (filters.category !== "all" && task.category.toLowerCase().trim() !== filters.category.toLowerCase().trim()) return false;
        if (filters.search.trim() !== "") {
          const q = filters.search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchCategory = task.category.toLowerCase().includes(q);
          const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "dueDate") {
          return new Date(a.dueDate || "9999-12-31").getTime() - new Date(b.dueDate || "9999-12-31").getTime();
        }
        if (filters.sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (filters.sortBy === "priorityWeight") {
          const weights: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filters]);

  const allSelected = filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      clearSelectedTasks();
    } else {
      selectAllTasks(filteredTasks.map((t) => t.id));
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">URGENT</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">HIGH</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">MEDIUM</span>;
      case "low":
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">LOW</span>;
    }
  };

  const getStatusPill = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Clock className="w-3 h-3 text-indigo-500" /> In Progress
          </span>
        );
      case "todo":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <CircleAlert className="w-3 h-3 text-amber-500" /> To Do
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Batch Actions Toolbar (if items selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-600/10 dark:bg-indigo-950/40 border border-indigo-500/30 rounded-2xl animate-fade-in-scale text-xs font-semibold text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-500" />
            <span>{selectedTaskIds.length} tasks selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkUpdateStatus("completed")}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors"
            >
              Mark Completed
            </button>
            <button
              onClick={() => bulkUpdateStatus("in_progress")}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors"
            >
              Mark In Progress
            </button>
            <button
              onClick={bulkDeleteTasks}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={clearSelectedTasks}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-400">
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAllToggle} aria-label="Select all tasks">
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mx-auto" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">
                  <button
                    onClick={() => setFilter("sortBy", "title")}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>Task Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">
                  <button
                    onClick={() => setFilter("sortBy", "priorityWeight")}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">
                  <button
                    onClick={() => setFilter("sortBy", "dueDate")}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-indigo-50/60 dark:bg-slate-800/60" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button onClick={() => toggleSelectTask(task.id)} aria-label={`Select task ${task.title}`}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 mx-auto" />
                          )}
                        </button>
                      </td>

                      {/* Task Title & Tags */}
                      <td className="p-3.5">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {task.title}
                        </Link>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"
                              >
                                <Tag className="w-2.5 h-2.5" />#{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{getStatusPill(task.status)}</td>

                      {/* Priority */}
                      <td className="p-3.5">{getPriorityBadge(task.priority)}</td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {task.category || "General"}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {task.dueDate || "N/A"}
                      </td>

                      {/* Row Actions */}
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              task.id,
                              task.status === "completed" ? "todo" : "completed"
                            )
                          }
                          title={task.status === "completed" ? "Mark incomplete" : "Mark completed"}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
