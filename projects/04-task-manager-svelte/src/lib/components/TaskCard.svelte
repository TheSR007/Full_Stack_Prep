<script lang="ts">
  import type { Task } from '$lib/types/task';
  import { taskStore } from '$lib/state/taskStore.svelte';
  import { Calendar, Trash2, Edit3 } from 'lucide-svelte';

  let { task }: { task: Task } = $props();

  const priorityBadgeStyles: Record<string, string> = {
    low: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30',
    high: 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/30',
    urgent: 'text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
  };
</script>

<div class="group relative p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/90 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-2.5">
  
  <!-- Top Row: Title Link on Left & Priority Badge on Top-Right -->
  <div class="flex items-start justify-between gap-3">
    <a
      href="/tasks/{task.id}"
      class="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 flex-1"
    >
      {task.title}
    </a>

    <span class="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border {priorityBadgeStyles[task.priority] || priorityBadgeStyles.low}">
      {task.priority}
    </span>
  </div>

  <!-- Description Preview -->
  {#if task.description}
    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
      {task.description}
    </p>
  {/if}

  <!-- Footer Divider Line -->
  <div class="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 text-slate-400 text-xs mt-1">
    
    <!-- Left: Due Date -->
    <div class="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
      {#if task.dueDate}
        <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{task.dueDate}</span>
      {/if}
    </div>

    <!-- Right: Category Pill & Actions -->
    <div class="flex items-center gap-2 shrink-0">
      {#if task.category}
        <span class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {task.category}
        </span>
      {/if}

      <button
        onclick={() => taskStore.openModal(task.id)}
        aria-label="Edit task"
        class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
      >
        <Edit3 class="w-3.5 h-3.5" />
      </button>

      <button
        onclick={() => taskStore.deleteTask(task.id)}
        aria-label="Delete task"
        class="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

  </div>

</div>
