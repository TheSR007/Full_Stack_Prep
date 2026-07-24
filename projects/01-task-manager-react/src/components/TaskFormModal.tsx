import React, { useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { X, Tag, Plus } from "lucide-react";

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Omit<Task, "id" | "createdAt">) => void;
    initialTask?: Task;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialTask,
}) => {
    const [title, setTitle] = useState(initialTask?.title || "");
    const [description, setDescription] = useState(
        initialTask?.description || "",
    );
    const [status, setStatus] = useState<TaskStatus>(
        initialTask?.status || "todo",
    );
    const [priority, setPriority] = useState<TaskPriority>(
        initialTask?.priority || "medium",
    );
    const [category, setCategory] = useState(
        initialTask?.category || "Work",
    );
    const [dueDate, setDueDate] = useState(
        initialTask?.dueDate || new Date().toISOString().slice(0, 10),
    );
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(initialTask?.tags || ["React"]);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title,
            description,
            status,
            priority,
            category,
            tags,
            dueDate,
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-fade-in-scale">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl transition-all duration-200 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {initialTask ? "Edit Task" : "Create New Task"}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col min-h-0">
                    <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-110px)] sm:max-h-[calc(85vh-120px)]">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Implement React Router v6"
                                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add task context or implementation details..."
                                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all leading-relaxed resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={e =>
                                        setStatus(e.target.value as TaskStatus)
                                    }
                                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer">
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={e =>
                                        setPriority(e.target.value as TaskPriority)
                                    }
                                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer">
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent Priority</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Tags{" "}
                                <span className="text-[10px] lowercase text-slate-400 font-normal">
                                    (Press Enter to add tag)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="e.g. Frontend"
                                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all mb-2"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(t => (
                                    <span
                                        key={t}
                                        onClick={() => handleRemoveTag(t)}
                                        className="bg-indigo-50 dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-indigo-100 dark:hover:bg-slate-700 transition">
                                        <Tag className="w-2.5 h-2.5 text-indigo-500" />{" "}
                                        #{t}
                                        <X className="w-3 h-3 text-slate-400 hover:text-rose-500 transition" />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all duration-150 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Save Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
