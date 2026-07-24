"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
  CircleAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Tag,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { updateTaskStatusAction } from "@/app/actions/taskActions";

export function KanbanBoard() {
  const [mounted, setMounted] = useState(false);
  const { tasks, filters, updateTaskStatus, deleteTask, openCreateModal, openEditModal } = useTaskStore();

  useEffect(() => {
    const animation = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(animation);
      setMounted(false);
    };
  }, []);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Priority Filter
        if (filters.priority !== "all" && task.priority !== filters.priority) return false;
        // Category Filter
        if (filters.category !== "all" && task.category.toLowerCase().trim() !== filters.category.toLowerCase().trim()) return false;
        // Multi-Field Search Filter
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
        // Default: createdAt descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filters]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-slate-200 dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    // Optimistic store update
    updateTaskStatus(draggableId, newStatus);
    // Server Action cache revalidation
    await updateTaskStatusAction(draggableId, newStatus);
  };

  const columns: { id: TaskStatus; title: string; icon: any; topBorder: string; iconColor: string }[] = [
    { id: "todo", title: "To Do", icon: CircleAlert, topBorder: "border-t-amber-500", iconColor: "text-amber-500" },
    { id: "in_progress", title: "In Progress", icon: Clock, topBorder: "border-t-indigo-500", iconColor: "text-indigo-500" },
    { id: "completed", title: "Completed", icon: CheckCircle2, topBorder: "border-t-emerald-500", iconColor: "text-emerald-500" },
  ];

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

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((col) => {
          const ColumnIcon = col.icon;
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 border-t-4 ${col.topBorder} rounded-2xl p-4 shadow-sm flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ColumnIcon className={`w-4 h-4 ${col.iconColor}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={openCreateModal}
                  title="Add Task to column"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Droppable Container with renderClone to fix drag offset */}
              <Droppable
                droppableId={col.id}
                renderClone={(provided, snapshot, rubric) => {
                  const task = filteredTasks.find((t) => t.id === rubric.draggableId) || colTasks[rubric.source.index];
                  if (!task) return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} />;

                  const totalSubs = task.subtasks?.length || 0;
                  const completedSubs = task.subtasks?.filter((s) => s.completed).length || 0;

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl p-3.5 shadow-2xl rotate-2 ring-4 ring-indigo-500/20 text-xs font-sans text-slate-900 dark:text-slate-100"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                          {task.category || "General"}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">{task.title}</div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      {totalSubs > 0 && (
                        <div className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" /> Subtasks ({completedSubs}/{totalSubs})
                        </div>
                      )}
                    </div>
                  );
                }}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 transition-colors duration-150 rounded-xl p-1 ${
                      snapshot.isDraggingOver ? "bg-indigo-500/5 ring-2 ring-indigo-500/20" : ""
                    }`}
                  >
                    {colTasks.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-medium text-center p-4">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      colTasks.map((task, index) => {
                        const totalSubs = task.subtasks?.length || 0;
                        const completedSubs = task.subtasks?.filter((s) => s.completed).length || 0;
                        const subProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(providedDrag, snapshotDrag) => (
                              <div
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                style={providedDrag.draggableProps.style}
                                className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all ${
                                  snapshotDrag.isDragging ? "opacity-40" : ""
                                }`}
                              >
                                {/* Top Row: Category & Priority */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50 truncate">
                                    {task.category || "General"}
                                  </span>
                                  {getPriorityBadge(task.priority)}
                                </div>

                                {/* Body Title & Description */}
                                <Link
                                  href={`/tasks/${task.id}`}
                                  className="block font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 mb-1 transition-colors line-clamp-2"
                                >
                                  {task.title}
                                </Link>

                                {task.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}

                                {/* Subtasks Progress Bar (if available) */}
                                {totalSubs > 0 && (
                                  <div className="mb-3 space-y-1">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="w-3 h-3 text-indigo-500" />
                                        Subtasks ({completedSubs}/{totalSubs})
                                      </span>
                                      <span className="font-mono font-bold">{subProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-indigo-600 h-full transition-all duration-300"
                                        style={{ width: `${subProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Tags Badges */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {task.tags.map((t) => (
                                      <span
                                        key={t}
                                        className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"
                                      >
                                        <Tag className="w-2.5 h-2.5" />
                                        #{t}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Bottom Row: Due Date & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{task.dueDate || "No date"}</span>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openEditModal(task)}
                                      title="Edit Task"
                                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      title="Delete Task"
                                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
