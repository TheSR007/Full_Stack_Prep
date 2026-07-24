"use client";

import React, { useMemo } from "react";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  PieChart,
  BarChart2,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskPriority } from "@/types/task";

export default function AnalyticsPage() {
  const tasks = useTaskStore((state) => state.tasks);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const urgent = tasks.filter((t) => t.priority === "urgent").length;

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityCounts: Record<TaskPriority, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    tasks.forEach((t) => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    return { total, completed, inProgress, urgent, rate, priorityCounts };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Real-Time Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Workload metrics, completion velocity, and task distribution insights.
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.completed}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              In Progress
            </span>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
              {metrics.inProgress}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Urgent Tasks
            </span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {metrics.urgent}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Analytics Cards (2 Grid Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Velocity Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Completion Velocity & Rate</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
              {metrics.rate}% Rate
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Overall Progress</span>
              <span>{metrics.completed} of {metrics.total} completed</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.rate}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/60">
            Velocity metrics are calculated dynamically from your stored task state. High completion velocity indicates optimal sprint pacing.
          </p>
        </div>

        {/* Priority Distribution Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>Priority Level Breakdown</span>
          </div>

          <div className="space-y-3">
            {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => {
              const count = metrics.priorityCounts[p] || 0;
              const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              let barColor = "bg-emerald-500";
              if (p === "urgent") barColor = "bg-rose-500";
              if (p === "high") barColor = "bg-amber-500";
              if (p === "medium") barColor = "bg-sky-500";

              return (
                <div key={p} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                    <span>{p}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${barColor} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
