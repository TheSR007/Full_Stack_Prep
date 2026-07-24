"use client";

import React from "react";
import { X, Command } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "N", description: "Open Create New Task modal" },
    { key: "/", description: "Focus multi-field search input" },
    { key: "B", description: "Navigate to Kanban Board view" },
    { key: "L", description: "Navigate to Task List view" },
    { key: "?", description: "Toggle Keyboard Shortcuts modal" },
    { key: "Esc", description: "Close modal / unfocus search input" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-scale space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <Command className="w-4 h-4 text-indigo-500" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60"
            >
              <span className="text-slate-600 dark:text-slate-400 font-medium">{sc.description}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold rounded-md text-slate-800 dark:text-slate-200 shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
