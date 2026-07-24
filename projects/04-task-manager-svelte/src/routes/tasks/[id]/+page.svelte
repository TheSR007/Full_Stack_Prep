<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import type { PageData } from './$types';
  import {
    ArrowLeft,
    Calendar,
    Tag,
    Edit3,
    Trash2,
    CheckCircle2,
    Clock,
    CircleAlert
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let task = $derived(
    taskStore.tasks.find((t) => t.id === data.taskId) || data.fallbackTask
  );

  const priorityBadgeStyles: Record<string, string> = {
    low: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30',
    high: 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/30',
    urgent: 'text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
  };

  const statusBadges: Record<string, { label: string; style: string; icon: any }> = {
    todo: { label: 'To Do', style: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: CircleAlert },
    in_progress: { label: 'In Progress', style: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30', icon: Clock },
    completed: { label: 'Completed', style: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 }
  };
</script>

<svelte:head>
  <title>{task ? task.title : 'Task Details'} — TaskFlow</title>
  <meta name="description" content={task ? task.description : 'Task details page'} />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
  
  {#if task}
    {@const statusInfo = statusBadges[task.status] || statusBadges.todo}
    {@const StatusIcon = statusInfo.icon}

    <!-- Main Detail Glass Panel -->
    <div class="glass-panel p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-md">
      
      <!-- Top Back Link -->
      <div>
        <a
          href="/tasks"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Previous Page</span>
        </a>
      </div>

      <!-- Title & Category Header -->
      <div class="flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div class="space-y-1">
          {#if task.category}
            <span class="text-xs font-extrabold text-indigo-500 uppercase tracking-wider block">
              {task.category}
            </span>
          {/if}
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {task.title}
          </h1>
        </div>

        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase shrink-0 {statusInfo.style}">
          <StatusIcon class="w-3.5 h-3.5" />
          <span>{statusInfo.label}</span>
        </span>
      </div>

      <!-- Task Description Section -->
      <div class="space-y-2">
        <h3 class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">TASK DESCRIPTION</h3>
        <div class="p-5 rounded-xl bg-slate-100/70 dark:bg-[#070a13]/80 border border-slate-200/80 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {task.description || 'No detailed description provided.'}
        </div>
      </div>

      <!-- Metadata Grid (3 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div class="p-4 rounded-xl bg-slate-100/60 dark:bg-[#070a13]/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
          <span class="text-[11px] font-semibold text-slate-400 block">Priority Level</span>
          <span class="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border {priorityBadgeStyles[task.priority] || priorityBadgeStyles.low}">
            {task.priority}
          </span>
        </div>

        <div class="p-4 rounded-xl bg-slate-100/60 dark:bg-[#070a13]/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
          <span class="text-[11px] font-semibold text-slate-400 block">Target Due Date</span>
          <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
            <Calendar class="w-3.5 h-3.5 text-indigo-500" />
            <span>{task.dueDate || 'No due date'}</span>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-100/60 dark:bg-[#070a13]/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
          <span class="text-[11px] font-semibold text-slate-400 block">Created On</span>
          <span class="text-xs font-mono font-bold text-slate-900 dark:text-white block">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <!-- Associated Tags Section -->
      {#if task.tags && task.tags.length > 0}
        <div class="space-y-2 pt-2">
          <h3 class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">ASSOCIATED TAGS</h3>
          <div class="flex flex-wrap gap-2">
            {#each task.tags as tag}
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                <Tag class="w-3 h-3" />
                #{tag}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Bottom Actions & Quick Status Switcher -->
      <div class="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <button
            onclick={() => taskStore.openModal(task.id)}
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit Task</span>
          </button>

          <button
            onclick={() => {
              taskStore.deleteTask(task.id);
              window.location.href = '/tasks';
            }}
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-400 mr-1">Quick Status Switch:</span>
          <button
            onclick={() => taskStore.updateStatus(task.id, 'todo')}
            class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all {task.status === 'todo' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-white'}"
          >
            To Do
          </button>
          <button
            onclick={() => taskStore.updateStatus(task.id, 'in_progress')}
            class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all {task.status === 'in_progress' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-white'}"
          >
            In Progress
          </button>
          <button
            onclick={() => taskStore.updateStatus(task.id, 'completed')}
            class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all {task.status === 'completed' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-white'}"
          >
            Completed
          </button>
        </div>
      </div>

    </div>
  {:else}
    <div class="text-center py-16 text-slate-400">
      <p class="text-base font-bold">Task Not Found</p>
      <a href="/tasks" class="text-xs text-indigo-500 hover:underline mt-2 inline-block">Back to Task List</a>
    </div>
  {/if}

</div>
