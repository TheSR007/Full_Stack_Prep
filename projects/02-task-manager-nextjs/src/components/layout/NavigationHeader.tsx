"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  BarChart3,
  Settings,
  Search,
  Sun,
  Moon,
  Plus,
  Command,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTaskStore } from "@/store/useTaskStore";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";

export function NavigationHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { filters, setFilter, openCreateModal, closeModal } = useTaskStore();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT";

      if (e.key === "Escape") {
        if (isInput) {
          (document.activeElement as HTMLElement).blur();
        }
        closeModal();
        setIsHelpOpen(false);
        return;
      }

      if (isInput) return;

      const key = e.key.toLowerCase();

      if (key === "n") {
        e.preventDefault();
        openCreateModal();
      } else if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("header-search-input");
        if (searchInput) searchInput.focus();
      } else if (key === "b") {
        e.preventDefault();
        router.push("/");
      } else if (key === "l") {
        e.preventDefault();
        router.push("/tasks");
      } else if (e.key === "?") {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openCreateModal, closeModal, router]);

  const navItems = [
    { label: "Board", href: "/", icon: LayoutGrid },
    { label: "List", href: "/tasks", icon: List },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Sticky Desktop & Mobile Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Desktop Navigation Pills */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                TM
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </Link>

            {/* Desktop Navigation Pills */}
            <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-950/80 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Shortcuts, Theme Toggle & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multi-Field Search Input */}
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="header-search-input"
                type="text"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Search tasks... (/)"
                className="w-44 md:w-56 pl-8 pr-7 py-1.5 bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
              />
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Keyboard Shortcuts Dialog Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              title="Keyboard Shortcuts (?)"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Sun/Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* "+ New Task" Primary CTA Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-indigo-700/50 px-1.5 py-0.5 rounded font-mono">N</kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Solid High-Contrast Background) */}
      <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md font-bold scale-105"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
