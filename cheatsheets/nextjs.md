# Next.js App Router Core Setup & Comprehensive Reference Cheatsheet (Next.js 16 + React 19)

A complete, production-ready guide covering initial Next.js project setup (App Router, TypeScript, Tailwind CSS v4) through state management, server/client components, Server Actions, Route Handlers, Edge Proxy (`src/proxy.ts`), dynamic metadata, loading/error states, drag-and-drop, and performance optimization.

---

## 1. Quick Start & Project Boilerplate Setup

### Current Stack & Versions
- **Framework**: Next.js 16 (`16.2.11`)
- **React**: React 19 (`19.2.8`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **TypeScript**: TypeScript 5.7+

### Step 1: Initialize Project with Next.js App Router & TypeScript
Run in your terminal from the project root:
```bash
npx -y create-next-app@latest projects/02-task-manager-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd projects/02-task-manager-nextjs
```

### Step 2: Install Core Dependencies
```bash
# Core Application Dependencies
npm install zustand lucide-react @hello-pangea/dnd clsx tailwind-merge @tanstack/react-query

# Dev Dependencies & Types
npm install -D @types/node @types/react @types/react-dom eslint typescript
```

### Step 3: Configure Tailwind CSS v4 & Glassmorphism (`src/app/globals.css`)
Update `src/app/globals.css`:
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200 antialiased;
  }
}

/* Glassmorphism panel utility */
.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass-panel {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Micro-animations */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-scale {
  animation: fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### Step 4: Configure TypeScript & Path Aliases (`tsconfig.json`)
Ensure `tsconfig.json` contains the `@/*` alias:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}
```

### Step 5: Configure App Favicon Metadata (`src/app/icon.svg`)
In Next.js App Router, place SVG favicons directly at `src/app/icon.svg` so Next.js's file-based metadata engine automatically generates standard `<link rel="icon">` tags:
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "TaskFlow — Next.js Task Manager",
  description: "Modern, high-productivity task management suite built with Next.js App Router.",
};
```

---

## 2. Core Next.js App Router Features & Reference Guide

### A. React Server Components (RSC) vs. Client Components

| Feature | Server Components (Default) | Client Components (`"use client"`) |
| :--- | :--- | :--- |
| **Execution Environment** | Server-side only (build/request time) | Browser (hydrated on client) + initial SSR |
| **Interactivity & State** | No state (`useState`), no effects (`useEffect`) | Fully interactive (`useState`, `useEffect`, event handlers) |
| **Data Fetching** | Async `async/await` directly in component | `useQuery` / `useEffect` / event triggers |
| **Bundle Impact** | 0KB client bundle footprint | Included in client JS bundle |
| **Direct Access** | Direct DB access, secrets, node APIs | Browser APIs (`window`, `localStorage`, DOM events) |

---

### B. Server Actions (`"use server"`) & Revalidation

```typescript
// src/app/actions/taskActions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function updateTaskStatusAction(taskId: string, status: string) {
  // Perform database or server-side mutation here
  console.log(`[Server Action] Task ${taskId} status updated to ${status}`);
  
  // Trigger Next.js App Router cache revalidation
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  
  return { success: true, taskId, status };
}
```

---

### C. Route Handlers (`app/api/tasks/route.ts`)

```typescript
// src/app/api/tasks/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  
  // Return JSON payload with standard status codes
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    filter: { search, priority },
    tasks: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    return NextResponse.json({ success: true, task: body }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 500 });
  }
}
```

---

### D. Dynamic Metadata (`generateMetadata`)

```tsx
// src/app/tasks/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Task Details | ${id} - TaskFlow`,
    description: `Detailed task inspection and management for task ${id}`,
  };
}
```

---

### E. Next.js 16 Edge Proxy (`src/proxy.ts`)

> **Note**: In Next.js 16+, `src/middleware.ts` is deprecated in favor of `src/proxy.ts` exporting a `proxy(request: NextRequest)` function.

```typescript
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-taskflow-version", "2.0.0");
  response.headers.set("x-powered-by", "Next.js 16 App Router");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

### F. Instant Loading & Error Recovery UI

#### 1. Loading Skeleton (`src/app/loading.tsx`)
```tsx
export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse max-w-7xl mx-auto">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl p-4" />
        ))}
      </div>
    </div>
  );
}
```

#### 2. Custom Error Boundary (`src/app/error.tsx`)
```tsx
"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-rose-500/20 rounded-2xl p-6 max-w-md text-center shadow-xl">
        <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Something went wrong</h2>
        <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl mb-4 font-mono">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
```

#### 3. Custom Not Found UI (`src/app/not-found.tsx`)
```tsx
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <FileQuestion className="w-16 h-16 text-indigo-500 mx-auto" />
        <h2 className="text-2xl font-extrabold">404 - Page Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The task or resource you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Board
        </Link>
      </div>
    </div>
  );
}
```

---

### G. Optimistic UI Updates (`useOptimistic`)

```tsx
"use client";

import { useOptimistic, startTransition } from "react";
import { updateTaskStatusAction } from "@/app/actions/taskActions";
import type { Task } from "@/store/useTaskStore";

export function OptimisticTaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (state, update: { id: string; status: Task["status"] }) =>
      state.map((t) => (t.id === update.id ? { ...t, status: update.status } : t))
  );

  const handleStatusChange = async (id: string, newStatus: Task["status"]) => {
    startTransition(() => {
      setOptimisticTasks({ id, status: newStatus });
    });
    await updateTaskStatusAction(id, newStatus);
  };

  return (
    <div className="space-y-2">
      {optimisticTasks.map((t) => (
        <div key={t.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex justify-between">
          <span>{t.title}</span>
          <button onClick={() => handleStatusChange(t.id, "completed")} className="text-xs text-indigo-500">
            Mark Completed
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Best Practices & Optimization Checklist
- [x] Use `"use client"` on interactive leaf components while keeping parent layouts/pages lightweight.
- [x] Implement **Server Actions** for server mutations alongside client Zustand optimistic state.
- [x] Provide Next.js dynamic metadata via `generateMetadata` for dynamic detail pages (`/tasks/[id]`).
- [x] Provide instant streaming feedback using `loading.tsx` and custom boundaries with `error.tsx` & `not-found.tsx`.
- [x] Use `src/proxy.ts` (Next.js 16+) for Edge proxy header injection and request handling.
- [x] Place SVG favicons at `src/app/icon.svg` for automatic Next.js App Router metadata binding.
- [x] Follow `/ui-ux-pro-max` guidelines for glassmorphism, 4/8dp spatial grid, WCAG color contrast, and vector iconography.
