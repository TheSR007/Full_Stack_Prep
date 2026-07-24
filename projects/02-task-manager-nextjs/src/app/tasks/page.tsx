"use client";

import React from "react";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { TaskDataTable } from "@/components/list/TaskDataTable";
import { useTaskStore } from "@/store/useTaskStore";

export default function TasksListPage() {
  const tasks = useTaskStore((state) => state.tasks);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            All Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tabular data table view with multi-select bulk operations ({tasks.length} total tasks).
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar />

      {/* Data Table Component */}
      <TaskDataTable />
    </div>
  );
}
