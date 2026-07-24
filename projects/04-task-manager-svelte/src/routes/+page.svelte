<script lang="ts">
  import { dndzone } from 'svelte-dnd-action';
  import { taskStore } from '$lib/state/taskStore.svelte';
  import FilterToolbar from '$lib/components/FilterToolbar.svelte';
  import TaskCard from '$lib/components/TaskCard.svelte';
  import type { TaskStatus, Task } from '$lib/types/task';
  import { CircleAlert, Clock, CheckCircle2, Plus } from 'lucide-svelte';

  const flipDurationMs = 200;

  const columns: { id: TaskStatus; label: string; icon: any; iconColor: string; badgeStyle: string; topBorder: string }[] = [
    {
      id: 'todo',
      label: 'To Do',
      icon: CircleAlert,
      iconColor: 'text-amber-500',
      badgeStyle: 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
      topBorder: 'border-t-4 border-amber-500'
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: Clock,
      iconColor: 'text-indigo-500',
      badgeStyle: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300',
      topBorder: 'border-t-4 border-indigo-500'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badgeStyle: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
      topBorder: 'border-t-4 border-emerald-500'
    }
  ];

  function getTasksForColumn(status: TaskStatus): Task[] {
    return taskStore.filteredTasks.filter((t) => t.status === status);
  }

  function handleDndConsider(columnId: TaskStatus, e: CustomEvent<{ items: Task[] }>) {
    const items = e.detail.items;
    items.forEach((item) => {
      if (item.status !== columnId) {
        taskStore.updateStatus(item.id, columnId);
      }
    });
  }

  function handleDndFinalize(columnId: TaskStatus, e: CustomEvent<{ items: Task[] }>) {
    const items = e.detail.items;
    items.forEach((item) => {
      if (item.status !== columnId) {
        taskStore.updateStatus(item.id, columnId);
      }
    });
  }
</script>

<svelte:head>
  <title>Kanban Board — TaskFlow</title>
  <meta name="description" content="Interactive drag-and-drop Kanban Board powered by Svelte 5 and SvelteKit." />
</svelte:head>

<div class="space-y-6">
  
  <!-- Filter & Sort Toolbar -->
  <FilterToolbar />

  <!-- Kanban Columns Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each columns as col}
      {@const items = getTasksForColumn(col.id)}
      {@const ColumnIcon = col.icon}

      <div class="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden {col.topBorder} shadow-md flex flex-col h-full min-h-[520px]">
        
        <!-- Column Header -->
        <div class="p-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-[#070a13]/40">
          <div class="flex items-center gap-2.5">
            <ColumnIcon class="w-4 h-4 {col.iconColor}" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">{col.label}</h3>
            <span class="px-2 py-0.5 text-xs font-bold rounded-full {col.badgeStyle}">
              {items.length}
            </span>
          </div>

          <button
            onclick={() => taskStore.openModal()}
            aria-label="Add task to column"
            class="p-1 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <!-- Droppable Card Area -->
        <div
          use:dndzone={{ items, flipDurationMs, zoneTabIndex: -1 }}
          onconsider={(e) => handleDndConsider(col.id, e)}
          onfinalize={(e) => handleDndFinalize(col.id, e)}
          class="p-4 space-y-3 min-h-[440px] flex-1 transition-colors duration-150"
        >
          {#each items as task (task.id)}
            <TaskCard {task} />
          {/each}

          {#if items.length === 0}
            <div class="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl text-slate-400 text-xs gap-1">
              <span>No tasks in {col.label.toLowerCase()}</span>
            </div>
          {/if}
        </div>

      </div>
    {/each}
  </div>

</div>
