import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { NavigationHeader } from "@/components/layout/NavigationHeader";
import { TaskFormModal } from "@/components/common/TaskFormModal";
import { ToastContainer } from "@/components/common/ToastContainer";

export const metadata: Metadata = {
  title: "TaskFlow — Next.js Task Manager",
  description: "Modern, high-productivity task management suite built with Next.js App Router, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased">
        <ThemeProvider>
          <NavigationHeader />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
            {children}
          </main>
          <TaskFormModal />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
