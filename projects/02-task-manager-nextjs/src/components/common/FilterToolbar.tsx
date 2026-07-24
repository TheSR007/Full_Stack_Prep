"use client";

import React, { useMemo } from "react";
import { Filter, ArrowUpDown, X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";

export function FilterToolbar() {
  const { tasks, filters, setFilter, resetFilters } = useTaskStore();

  // Dynamic Category Extraction: Deduplicated case-insensitively & sorted alphabetically
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.category) {
        const lower = t.category.toLowerCase().trim();
        if (!map.has(lower)) {
          map.set(lower, t.category.trim());
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const isFiltered =
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.sortBy !== "createdAt" ||
    filters.search !== "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Filter:</span>
        </div>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => setFilter("priority", e.target.value)}
          aria-label="Filter by priority"
          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Dynamic Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
          aria-label="Filter by category"
          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Sort & Reset Controls */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sort:</span>
        </div>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilter("sortBy", e.target.value as any)}
          aria-label="Sort tasks by"
          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
        >
          <option value="createdAt">Date Created</option>
          <option value="dueDate">Due Date</option>
          <option value="priorityWeight">Priority Level</option>
          <option value="title">Task Title</option>
        </select>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl border border-rose-500/30 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
