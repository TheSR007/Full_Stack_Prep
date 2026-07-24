import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Database, Sparkles, RefreshCw } from "lucide-react";
import { useDocumentTitle } from "../hooks/useCustomHooks";

export const Settings: React.FC = () => {
    useDocumentTitle("Settings");
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-md space-y-6 transition-all duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> App
                    Settings & Preferences
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Customize your theme and manage application state storage
                    options.
                </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Appearance Mode
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Toggle between Light and Dark mode UI themes.
                    </p>
                </div>
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-amber-400 transition-all shadow-2xs">
                    {theme === "dark" ? (
                        <>
                            <Moon className="w-4 h-4 text-indigo-400" /> Dark
                            Mode
                        </>
                    ) : (
                        <>
                            <Sun className="w-4 h-4 text-amber-500" /> Light
                            Mode
                        </>
                    )}
                </button>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Local State Persistence
                    </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tasks and board columns are saved continuously to your local
                    browser storage using Zustand persistence. Clearing data
                    will restore original seed tasks.
                </p>
                <button
                    onClick={() => {
                        localStorage.removeItem("task-manager-zustand-store");
                        window.location.reload();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/20 dark:hover:bg-rose-500/30 transition shadow-2xs">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Store to Default
                    Seed
                </button>
            </div>
        </div>
    );
};
