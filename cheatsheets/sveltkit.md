# SvelteKit & Svelte 5 Core Setup & Comprehensive Reference Cheatsheet

A complete, production-ready guide covering initial SvelteKit setup, Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`), routing architecture, form actions, server load functions, REST API endpoints, view transitions, and full-stack task management patterns.

---

## 1. Quick Start & Project Boilerplate Setup

### Step 1: Initialize Project with SvelteKit & TypeScript
Run in your terminal:
```bash
mkdir -p projects/04-task-manager-svelte
cd projects/04-task-manager-svelte
npx -y sv create . --template minimal --types ts --no-add-ons
```

### Step 2: Install Core Dependencies & Tailwind CSS v4
```bash
# Core Dependencies & Vector Icons
npm install lucide-svelte svelte-dnd-action clsx tailwind-merge

# Tailwind CSS v4, Vite & Tooling
npm install -D tailwindcss @tailwindcss/vite @sveltejs/adapter-auto @sveltejs/kit typescript vite
```

### Step 3: Configure Vite & Svelte Config (`vite.config.ts` & `svelte.config.js`)

Update `vite.config.ts`:
```typescript
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
});
```

Update `svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
      '$lib/*': 'src/lib/*',
    }
  }
};

export default config;
```

Update `src/app.css` (Tailwind CSS v4, Dark Variant & Option Backgrounds):
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-[#070a13] dark:text-slate-100 min-h-screen font-sans transition-colors duration-200 antialiased;
  }

  /* Fix select dropdown option background in dark mode */
  option {
    @apply bg-white text-slate-900 dark:bg-[#0d1322] dark:text-slate-100;
  }
}

/* Glassmorphism panel utility */
.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass-panel {
  background: rgba(13, 19, 34, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

Update `src/app.html`:
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.svg" type="image/svg+xml" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="bg-slate-50 dark:bg-[#070a13] min-h-screen">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

---

## 2. Svelte 5 Runes Reference Guide

Svelte 5 replaces legacy store subscriptions (`$store`) and reactive declarations (`$:`) with **Runes**. Runes are compiler primitives that work inside `.svelte` files and `.svelte.ts` modules.

| Rune | Primary Use Case | Svelte 5 Code Snippet |
| --- | --- | --- |
| `$state()` | Reactive state variable | `let count = $state(0);` |
| `$state.raw()` | Non-deeply reactive state (performance optimization for large objects) | `let tasks = $state.raw<Task[]>([]);` |
| `$derived()` | Computed value derived from reactive state | `let completedTasks = $derived(tasks.filter(t => t.status === 'completed'));` |
| `$derived.by()` | Complex computed expression with a function block | `let stats = $derived.by(() => { return calculateStats(tasks); });` |
| `$effect()` | Re-run side effect when dependent state changes | `$effect(() => { localStorage.setItem('theme', theme); });` |
| `$effect.pre()` | Runs effect before DOM updates | `$effect.pre(() => { prepareAnimation(); });` |
| `$props()` | Declare component input props | `let { task, onEdit }: { task: Task, onEdit: (id: string) => void } = $props();` |
| `$bindable()` | Allow two-way binding on component prop | `let { value = $bindable() }: { value: string } = $props();` |
| `$inspect()` | Console log reactive state changes during development | `$inspect(tasks).with(console.log);` |

---

## 3. SvelteKit Architecture & Routing Conventions

SvelteKit uses a file-system based router located inside `src/routes/`.

```
src/
├── app.css
├── app.html
├── hooks.server.ts             # Server middleware (logging, custom headers, auth)
├── lib/
│   ├── components/             # UI Components (NavigationHeader, TaskCard, FilterToolbar, Modal)
│   ├── state/
│   │   └── taskStore.svelte.ts # Svelte 5 Runes Global State Store
│   ├── types/
│   │   └── task.ts             # TypeScript Task Data Interfaces
│   └── data/
│       └── seedTasks.ts        # Seed Task Dataset
└── routes/
    ├── +layout.server.ts       # Root layout server load function
    ├── +layout.svelte          # Root layout shell with Header & Glassmorphism
    ├── +page.server.ts         # Server load & Form Actions for Kanban Board
    ├── +page.svelte            # Kanban Board View (`/`)
    ├── +error.svelte           # Custom 404 / 500 Error boundary page
    ├── api/
    │   └── tasks/
    │       ├── +server.ts      # REST API Endpoint GET & POST
    │       └── [id]/
    │           └── +server.ts  # REST API Endpoint GET, PATCH, DELETE
    ├── analytics/
    │   ├── +page.server.ts     # Analytics server load
    │   └── +page.svelte        # Analytics Dashboard View (`/analytics`)
    ├── settings/
    │   ├── +page.server.ts     # Settings server load & reset form action
    │   └── +page.svelte        # Settings View (`/settings`)
    └── tasks/
        ├── +page.server.ts     # Task List view server load
        ├── +page.svelte        # Task List Data Table View (`/tasks`)
        └── [id]/
            ├── +page.server.ts # Task Detail server load
            └── +page.svelte    # Task Detail Page (`/tasks/:id`)
```

---

## 4. Key SvelteKit Technical Patterns

### A. Data Loading & Page Server (`+page.server.ts`)
Server load functions run on the server and pass returned data to `+page.svelte` via the `data` prop.

```typescript
// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '$lib/server/taskService';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const tasks = await getTasks();
  return {
    tasks
  };
};

export const actions: Actions = {
  createTask: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString() || '';
    const priority = formData.get('priority')?.toString() || 'medium';
    const category = formData.get('category')?.toString() || 'General';
    const dueDate = formData.get('dueDate')?.toString() || '';

    if (!title || title.trim().length === 0) {
      return fail(400, { title, error: 'Title is required' });
    }

    const newTask = await createTask({ title, description, priority, category, dueDate });
    return { success: true, task: newTask };
  },

  updateStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const status = formData.get('status')?.toString();

    if (!id || !status) return fail(400, { error: 'Invalid parameters' });

    await updateTaskStatus(id, status);
    return { success: true };
  },

  deleteTask: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing task ID' });

    await deleteTask(id);
    return { success: true };
  }
};
```

### B. Consuming Data & Progressive Enhancement in Svelte 5 (`+page.svelte`)

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Svelte 5 Runes state initialized from SSR data
  let filterPriority = $state('all');
  let filterCategory = $state('all');

  let filteredTasks = $derived.by(() => {
    return data.tasks.filter((task) => {
      const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchCategory = filterCategory === 'all' || task.category.toLowerCase() === filterCategory.toLowerCase();
      return matchPriority && matchCategory;
    });
  });
</script>

<div class="space-y-6">
  <!-- Progressive Enhancement Form Action -->
  <form method="POST" action="?/createTask" use:enhance class="flex gap-2">
    <input name="title" placeholder="New task title..." required class="px-3 py-2 border rounded-xl" />
    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Add Task</button>
  </form>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each filteredTasks as task (task.id)}
      <div class="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
        <h4 class="font-bold">{task.title}</h4>
        <p class="text-xs text-slate-500">{task.description}</p>
        
        <form method="POST" action="?/deleteTask" use:enhance>
          <input type="hidden" name="id" value={task.id} />
          <button type="submit" class="text-xs text-rose-500 hover:underline mt-2">Delete</button>
        </form>
      </div>
    {/each}
  </div>
</div>
```

---

### C. Svelte 5 Runes State Store (`src/lib/state/taskStore.svelte.ts`)

```typescript
import type { Task, TaskStatus, TaskPriority } from '$lib/types/task';
import { seedTasks } from '$lib/data/seedTasks';

class TaskStore {
  tasks = $state<Task[]>([]);
  searchQuery = $state<string>('');
  selectedPriority = $state<string>('all');
  selectedCategory = $state<string>('all');
  sortBy = $state<'created' | 'due' | 'priority' | 'title'>('created');
  theme = $state<'dark' | 'light'>('dark');

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('taskflow-theme') as 'dark' | 'light';
      if (savedTheme) this.theme = savedTheme;

      const savedTasks = localStorage.getItem('taskflow-svelte-tasks');
      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks);
        } catch {
          this.tasks = seedTasks;
        }
      } else {
        this.tasks = seedTasks;
      }
    }
  }

  // Derived Values
  categories = $derived.by(() => {
    const set = new Set<string>();
    this.tasks.forEach((t) => set.add(t.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  });

  filteredTasks = $derived.by(() => {
    return this.tasks
      .filter((task) => {
        const matchesSearch =
          this.searchQuery === '' ||
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesPriority =
          this.selectedPriority === 'all' || task.priority === this.selectedPriority;

        const matchesCategory =
          this.selectedCategory === 'all' ||
          task.category.toLowerCase() === this.selectedCategory.toLowerCase();

        return matchesSearch && matchesPriority && matchesCategory;
      })
      .sort((a, b) => {
        if (this.sortBy === 'title') return a.title.localeCompare(b.title);
        if (this.sortBy === 'due') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (this.sortBy === 'priority') {
          const weights: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  });

  // Actions
  addTask(newTask: Omit<Task, 'id' | 'createdAt'>) {
    const task: Task = {
      ...newTask,
      id: `task-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.tasks = [task, ...this.tasks];
    this.persist();
  }

  updateStatus(id: string, status: TaskStatus) {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, status } : t));
    this.persist();
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persist();
  }

  resetSeed() {
    this.tasks = seedTasks;
    this.persist();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow-theme', this.theme);
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow-svelte-tasks', JSON.stringify(this.tasks));
    }
  }
}

export const taskStore = new TaskStore();
```

---

### D. REST API Endpoints in SvelteKit (`+server.ts`)

```typescript
// src/routes/api/tasks/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTasks, createTask } from '$lib/server/taskService';

export const GET: RequestHandler = async ({ url }) => {
  const priority = url.searchParams.get('priority');
  let tasks = await getTasks();

  if (priority && priority !== 'all') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  return json(tasks);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  if (!body.title) {
    return json({ error: 'Task title is required' }, { status: 400 });
  }

  const newTask = await createTask(body);
  return json(newTask, { status: 201 });
};
```

---

### E. View Transitions & Navigation Hooks (`src/routes/+layout.svelte`)

```svelte
<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
  import { taskStore } from '$lib/state/taskStore.svelte';
  import NavigationHeader from '$lib/components/NavigationHeader.svelte';
  import TaskFormModal from '$lib/components/TaskFormModal.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Reactive effect for SSR hydration data in Svelte 5
  $effect(() => {
    if (data?.initialTasks) {
      taskStore.initializeFromSSR(data.initialTasks);
    }
  });

  // Native View Transitions API support in SvelteKit
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070a13] dark:text-slate-100 transition-colors duration-200 antialiased font-sans">
  <NavigationHeader />
  <main class="max-w-7xl mx-auto px-4 py-6">
    {@render children()}
  </main>
  <TaskFormModal />
  <ToastContainer />
</div>
```

---

### F. Server Middleware Hook (`src/hooks.server.ts`)

```typescript
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  
  // Custom request header injection or auth check
  event.locals.requestTime = new Date().toISOString();

  const response = await resolve(event);

  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Framework', 'SvelteKit-Svelte5');

  return response;
};
```

---

## 5. Best Practices & Optimization Checklist

- [x] Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`) instead of legacy store syntax.
- [x] Leverage `+page.server.ts` for SSR load functions and progressive form actions using `use:enhance`.
- [x] Implement dynamic category discovery using `$derived.by()` with case-insensitive deduplication and alphabetical sorting.
- [x] Configure Tailwind CSS v4 with custom dark variant `@custom-variant dark (&:where(.dark, .dark *));`.
- [x] Support seamless theme switching with persistence in `localStorage` and `document.documentElement` `.dark` class.
- [x] Integrate `lucide-svelte` vector icons for clean UI elements (no structural emojis).
- [x] Integrate View Transitions API using SvelteKit's `onNavigate` hook.
- [x] Add custom `+error.svelte` for graceful 404 and 500 handling.
