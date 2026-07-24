<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import FilterToolbar from '$lib/components/FilterToolbar.svelte';
  import {
    Trash2,
    Edit3,
    CheckCircle2,
    Clock,
    CircleAlert,
    ArrowUpDown
  } from 'lucide-svelte';

  const priorityStyles: Record<string, string> = {
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
  <title>Task List — TaskFlow</title>
  <meta name="description" content="Tabular task list view with multi-criteria sorting and category filtering." />
</svelte:head>

<div class="space-y-6">
  
  <FilterToolbar />

  <!-- Data Table Container -->
  <div class="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-md space-y-4">
    
    <!-- Top Table Header Title -->
    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">All Tasks</h2>
      <p class="text-xs text-slate-400">
        Showing {taskStore.filteredTasks.length} tasks
      </p>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100/70 dark:bg-[#070a13]/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-extrabold uppercase tracking-wider">
            <th class="py-3.5 px-4 cursor-pointer hover:text-indigo-500" onclick={() => taskStore.sortBy = 'title'}>
              <div class="flex items-center gap-1">
                <span>Task Title</span>
                <ArrowUpDown class="w-3 h-3" />
              </div>
            </th>
            <th class="py-3.5 px-4">Status</th>
            <th class="py-3.5 px-4 cursor-pointer hover:text-indigo-500" onclick={() => taskStore.sortBy = 'priority'}>
              <div class="flex items-center gap-1">
                <span>Priority</span>
                <ArrowUpDown class="w-3 h-3" />
              </div>
            </th>
            <th class="py-3.5 px-4">Category</th>
            <th class="py-3.5 px-4 cursor-pointer hover:text-indigo-500" onclick={() => taskStore.sortBy = 'due'}>
              <div class="flex items-center gap-1">
                <span>Due Date</span>
                <ArrowUpDown class="w-3 h-3" />
              </div>
            </th>
            <th class="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
          {#each taskStore.filteredTasks as task (task.id)}
            {@const statusInfo = statusBadges[task.status] || statusBadges.todo}
            {@const StatusIcon = statusInfo.icon}

            <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
              
              <!-- Task Title -->
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                <a href="/tasks/{task.id}" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {task.title}
                </a>
              </td>

              <!-- Status Pill -->
              <td class="py-3.5 px-4">
                <button
                  onclick={() => {
                    const next = task.status === 'completed' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'completed';
                    taskStore.updateStatus(task.id, next);
                  }}
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase transition-all active:scale-95 {statusInfo.style}"
                >
                  <StatusIcon class="w-3.5 h-3.5" />
                  <span>{statusInfo.label}</span>
                </button>
              </td>

              <!-- Priority Badge -->
              <td class="py-3.5 px-4">
                <span class="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border {priorityStyles[task.priority] || priorityStyles.low}">
                  {task.priority}
                </span>
              </td>

              <!-- Category -->
              <td class="py-3.5 px-4">
                {#if task.category}
                  <span class="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {task.category}
                  </span>
                {/if}
              </td>

              <!-- Due Date -->
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                {task.dueDate || '-'}
              </td>

              <!-- Row Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    onclick={() => {
                      const next = task.status === 'completed' ? 'todo' : 'completed';
                      taskStore.updateStatus(task.id, next);
                    }}
                    title="Toggle Complete"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 {task.status === 'completed' ? 'text-emerald-500' : ''}" />
                  </button>
                  <button
                    onclick={() => taskStore.openModal(task.id)}
                    aria-label="Edit task"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    onclick={() => taskStore.deleteTask(task.id)}
                    aria-label="Delete task"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>

            </tr>
          {/each}

          {#if taskStore.filteredTasks.length === 0}
            <tr>
              <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                No matching tasks found.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

</div>
