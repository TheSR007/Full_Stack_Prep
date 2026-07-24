"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";

export function ToastContainer() {
  const { toasts, removeToast } = useTaskStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500" />;
        let borderClass = "border-blue-500/30 bg-blue-50/90 dark:bg-slate-900/95";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          borderClass = "border-emerald-500/30 bg-emerald-50/90 dark:bg-slate-900/95";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
          borderClass = "border-amber-500/30 bg-amber-50/90 dark:bg-slate-900/95";
        } else if (toast.type === "error") {
          icon = <AlertOctagon className="w-4 h-4 text-rose-500" />;
          borderClass = "border-rose-500/30 bg-rose-50/90 dark:bg-slate-900/95";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-fade-in-scale text-xs font-semibold ${borderClass}`}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-slate-900 dark:text-slate-100">{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
