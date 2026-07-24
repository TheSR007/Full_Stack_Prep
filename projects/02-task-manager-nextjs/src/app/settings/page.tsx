"use client";

import React, { useRef } from "react";
import { Sun, Moon, RotateCcw, Download, Upload, Database, Layers } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTaskStore } from "@/store/useTaskStore";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { resetStore, exportJSON, exportCSV, importJSON, addToast } = useTaskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadJSON = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Exported tasks to JSON file");
  };

  const handleDownloadCSV = () => {
    const csvStr = exportCSV();
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Exported tasks to CSV file");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Settings & Data Operations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage application theme preferences, state store backup/restore, and reset seed data.
        </p>
      </div>

      {/* Theme Settings Panel */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Theme</span>
            <p className="text-[11px] text-slate-500">Toggle between Light mode and Dark mode.</p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" /> Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Backup & Import Operations */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <Database className="w-4 h-4 text-indigo-500" />
          <span>Data Import & Export Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON / CSV */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-500" /> Export Task Backup
            </span>
            <p className="text-[11px] text-slate-500">Download current task records as JSON or CSV files.</p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                JSON Export
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                CSV Export
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-500" /> Restore / Import Seed
            </span>
            <p className="text-[11px] text-slate-500">Upload a valid task JSON seed file to replace active store.</p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Upload JSON Seed
            </button>
          </div>
        </div>
      </div>

      {/* State Store Persistence Reset */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <Layers className="w-4 h-4 text-rose-500" />
          <span>Local State Reset Control</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reset Local Storage Store</span>
            <p className="text-[11px] text-slate-500">Restores task manager state back to initial seed data.</p>
          </div>

          <button
            onClick={resetStore}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Store
          </button>
        </div>
      </div>
    </div>
  );
}
