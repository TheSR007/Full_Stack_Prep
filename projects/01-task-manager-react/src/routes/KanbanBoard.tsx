import React from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd";
import { useTaskStore } from "../store/useTaskStore";
import type { Task, TaskStatus } from "../types/task";
import { Link } from "react-router-dom";
import {
    Plus,
    Trash2,
    Calendar,
    CheckCircle2,
    Clock,
    CircleAlert,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useCustomHooks";

interface KanbanBoardProps {
    onOpenCreateModal: () => void;
    searchQuery: string;
}

const COLUMNS: {
    id: TaskStatus;
    title: string;
    accentColor: string;
    badgeBg: string;
    icon: React.ReactNode;
}[] = [
    {
        id: "todo",
        title: "To Do",
        accentColor: "from-amber-500 to-amber-600",
        badgeBg:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: <CircleAlert className="w-4 h-4 text-amber-500" />,
    },
    {
        id: "in_progress",
        title: "In Progress",
        accentColor: "from-blue-500 to-indigo-600",
        badgeBg:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: <Clock className="w-4 h-4 text-blue-500" />,
    },
    {
        id: "completed",
        title: "Completed",
        accentColor: "from-emerald-500 to-teal-600",
        badgeBg:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    onOpenCreateModal,
    searchQuery,
}) => {
    useDocumentTitle("Kanban Board");
    const { tasks, updateTaskStatus, deleteTask } = useTaskStore();

    const filteredTasks = tasks.filter(
        t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleOnDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as TaskStatus;
        updateTaskStatus(draggableId, newStatus);
    };

    const getPriorityBadge = (priority: Task["priority"]) => {
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
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(col => {
                    const colTasks = filteredTasks.filter(
                        t => t.status === col.id,
                    );

                    return (
                        <div
                            key={col.id}
                            className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col min-h-[550px] shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                            {/* Top Accent Bar */}
                            <div
                                className={`h-1.5 w-full bg-gradient-to-r ${col.accentColor}`}
                            />

                            <div className="p-4 flex flex-col flex-1">
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        {col.icon}
                                        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                                            {col.title}
                                        </h2>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-bold border ${col.badgeBg}`}>
                                            {colTasks.length}
                                        </span>
                                    </div>
                                    {col.id === "todo" && (
                                        <button
                                            onClick={onOpenCreateModal}
                                            aria-label="Add Task to To Do"
                                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 space-y-3 p-1 rounded-xl transition-colors duration-150 ${
                                                snapshot.isDraggingOver
                                                    ? "bg-indigo-50/50 dark:bg-slate-800/40 ring-2 ring-indigo-500/30 ring-dashed"
                                                    : ""
                                            }`}>
                                            {colTasks.length === 0 ? (
                                                <div className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-400 dark:text-slate-600 my-auto">
                                                    <span className="text-xs font-medium">
                                                        No tasks here
                                                    </span>
                                                    {col.id === "todo" && (
                                                        <button
                                                            onClick={
                                                                onOpenCreateModal
                                                            }
                                                            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                                            + Create a task
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                colTasks.map((task, index) => (
                                                    <Draggable
                                                        key={task.id}
                                                        draggableId={task.id}
                                                        index={index}>
                                                        {(
                                                            providedDrag,
                                                            snapshotDrag,
                                                        ) => (
                                                            <div
                                                                ref={
                                                                    providedDrag.innerRef
                                                                }
                                                                {...providedDrag.draggableProps}
                                                                {...providedDrag.dragHandleProps}
                                                                className={`group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-xl shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all duration-200 ${
                                                                    snapshotDrag.isDragging
                                                                        ? "shadow-2xl ring-2 ring-indigo-500/50 scale-[1.02] rotate-1 z-50 bg-white dark:bg-slate-900"
                                                                        : ""
                                                                }`}>
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <Link
                                                                        to={`/tasks/${task.id}`}
                                                                        className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-1">
                                                                        {
                                                                            task.title
                                                                        }
                                                                    </Link>
                                                                    <span
                                                                        className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 border rounded-md shadow-2xs ${getPriorityBadge(
                                                                            task.priority,
                                                                        )}`}>
                                                                        {
                                                                            task.priority
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 font-normal leading-relaxed">
                                                                    {task.description ||
                                                                        "No description provided."}
                                                                </p>

                                                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                                                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                        <span>
                                                                            {
                                                                                task.dueDate
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                                                            {
                                                                                task.category
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                deleteTask(
                                                                                    task.id,
                                                                                )
                                                                            }
                                                                            aria-label="Delete task"
                                                                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-80 group-hover:opacity-100">
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};
