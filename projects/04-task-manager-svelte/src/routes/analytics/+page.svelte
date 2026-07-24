<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import {
    CheckSquare,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    Layers
  } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Analytics Dashboard — TaskFlow</title>
  <meta name="description" content="Real-time workload metrics, completion velocity, and priority breakdown." />
</svelte:head>

<div class="space-y-8">
  
  <!-- Header Title & Completion Badge -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics & Task Metrics</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Real-time overview of workload distribution, completion velocity, and priority levels.
      </p>
    </div>

    <div class="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
      <TrendingUp class="w-4 h-4" />
      <span>{taskStore.stats.completionRate}% Complete</span>
    </div>
  </div>

  <!-- 4 Stat Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Tasks -->
    <div class="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-md">
      <div class="p-3 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 text-indigo-500 shrink-0">
        <CheckSquare class="w-5 h-5" />
      </div>
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">TOTAL TASKS</span>
        <p class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono leading-none mt-1">
          {taskStore.stats.total}
        </p>
      </div>
    </div>

    <!-- Completed Tasks -->
    <div class="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-md">
      <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
        <CheckCircle2 class="w-5 h-5" />
      </div>
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">COMPLETED</span>
        <p class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono leading-none mt-1">
          {taskStore.stats.completed}
        </p>
      </div>
    </div>

    <!-- In Progress Tasks -->
    <div class="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-md">
      <div class="p-3 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
        <Clock class="w-5 h-5" />
      </div>
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">IN PROGRESS</span>
        <p class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono leading-none mt-1">
          {taskStore.stats.inProgress}
        </p>
      </div>
    </div>

    <!-- Urgent Tasks -->
    <div class="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-md">
      <div class="p-3 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
        <AlertTriangle class="w-5 h-5" />
      </div>
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">URGENT TASKS</span>
        <p class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono leading-none mt-1">
          {taskStore.stats.urgent}
        </p>
      </div>
    </div>
  </div>

  <!-- Detailed Charts Section Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- Completion Rate Card -->
    <div class="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-md">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-indigo-500" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Overall Completion Rate</h3>
        </div>

        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
          {taskStore.stats.completionRate}%
        </span>
      </div>

      <!-- Gradient Progress Bar -->
      <div class="space-y-3">
        <div class="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-500"
            style="width: {taskStore.stats.completionRate}%"
          ></div>
        </div>
        <div class="flex justify-between text-xs font-bold text-slate-400">
          <span>Completed: <strong class="text-slate-200">{taskStore.stats.completed}</strong></span>
          <span>Pending: <strong class="text-slate-200">{taskStore.stats.total - taskStore.stats.completed}</strong></span>
        </div>
      </div>
    </div>

    <!-- Priority Distribution Card -->
    <div class="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-md">
      <div class="flex items-center gap-2">
        <Layers class="w-4 h-4 text-indigo-500" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Priority Distribution</h3>
      </div>

      <div class="space-y-3">
        {#each ['urgent', 'high', 'medium', 'low'] as p}
          {@const count = taskStore.tasks.filter((t) => t.priority === p).length}
          {@const percent = taskStore.stats.total > 0 ? Math.round((count / taskStore.stats.total) * 100) : 0}
          {@const barColor = p === 'urgent' ? 'bg-rose-500' : p === 'high' ? 'bg-amber-500' : p === 'medium' ? 'bg-sky-500' : 'bg-emerald-500'}
          {@const textColor = p === 'urgent' ? 'text-rose-400' : p === 'high' ? 'text-amber-400' : p === 'medium' ? 'text-sky-400' : 'text-emerald-400'}

          <div class="flex items-center justify-between gap-4">
            <span class="text-xs font-semibold capitalize w-24 shrink-0 {textColor}">
              {p} ({count})
            </span>
            
            <div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
              <div class="h-full rounded-full {barColor} transition-all duration-300" style="width: {percent}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

  </div>

</div>
