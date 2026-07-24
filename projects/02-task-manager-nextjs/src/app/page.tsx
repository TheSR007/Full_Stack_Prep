"use client";

import React from "react";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <FilterToolbar />

      {/* Kanban Board Container */}
      <KanbanBoard />
    </div>
  );
}
