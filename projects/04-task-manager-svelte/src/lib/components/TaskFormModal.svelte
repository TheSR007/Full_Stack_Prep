<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import type { TaskPriority, TaskStatus } from '$lib/types/task';
  import { X, Save } from 'lucide-svelte';

  let title = $state('');
  let description = $state('');
  let priority = $state<TaskPriority>('medium');
  let status = $state<TaskStatus>('todo');
  let category = $state('General');
  let dueDate = $state('');
  let tagInput = $state('');
  let tags = $state<string[]>([]);

  const optionClass = "bg-white text-slate-900 dark:bg-[#0d1322] dark:text-slate-100 py-1";

  $effect(() => {
    if (taskStore.isModalOpen) {
      if (taskStore.editingTaskId) {
        const existing = taskStore.tasks.find((t) => t.id === taskStore.editingTaskId);
        if (existing) {
          title = existing.title;
          description = existing.description;
          priority = existing.priority;
          status = existing.status;
          category = existing.category;
          dueDate = existing.dueDate;
          tags = [...existing.tags];
        }
      } else {
        // Reset defaults
        title = '';
        description = '';
        priority = 'medium';
        status = 'todo';
        category = 'General';
        dueDate = new Date().toISOString().split('T')[0];
        tagInput = '';
        tags = ['svelte', 'task'];
      }
    }
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskStore.editingTaskId) {
      taskStore.updateTask(taskStore.editingTaskId, {
        title,
        description,
        priority,
        status,
        category,
        dueDate,
        tags
      });
    } else {
      taskStore.addTask({
        title,
        description,
        priority,
        status,
        category,
        dueDate,
        tags
      });
    }

    taskStore.closeModal();
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      tags = [...tags, tagInput.trim().toLowerCase()];
      tagInput = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }
</script>

{#if taskStore.isModalOpen}
  <!-- Inset Fixed Screen Backdrop -->
  <div
    role="button"
    tabindex="-1"
    aria-label="Close modal backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    onclick={(e) => {
      if (e.target === e.currentTarget) taskStore.closeModal();
    }}
    onkeydown={(e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') taskStore.closeModal();
    }}
  >
    <!-- Dialog Panel Container -->
    <div class="w-full max-w-lg bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      
      <!-- Fixed Header (shrink-0) -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#070a13]/50">
        <h3 class="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {taskStore.editingTaskId ? 'Edit Task' : 'Create New Task'}
        </h3>
        <button
          onclick={() => taskStore.closeModal()}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Form Body (overflow-y-auto) -->
      <form id="task-modal-form" onsubmit={handleSubmit} class="p-6 space-y-4 overflow-y-auto flex-1">
        
        <!-- Task Title -->
        <div class="space-y-1">
          <label for="task-title" class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Task Title <span class="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            bind:value={title}
            placeholder="e.g. Implement Svelte 5 Runes state store"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label for="task-desc" class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            id="task-desc"
            rows="3"
            bind:value={description}
            placeholder="Detailed description of task scope and deliverables..."
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          ></textarea>
        </div>

        <!-- Grid: Priority & Status -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="task-priority" class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              id="task-priority"
              bind:value={priority}
              class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="low" class={optionClass}>Low</option>
              <option value="medium" class={optionClass}>Medium</option>
              <option value="high" class={optionClass}>High</option>
              <option value="urgent" class={optionClass}>Urgent</option>
            </select>
          </div>

          <div class="space-y-1">
            <label for="task-status" class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              id="task-status"
              bind:value={status}
              class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="todo" class={optionClass}>To Do</option>
              <option value="in_progress" class={optionClass}>In Progress</option>
              <option value="completed" class={optionClass}>Completed</option>
            </select>
          </div>
        </div>

        <!-- Grid: Category & Due Date -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="task-category" class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <input
              id="task-category"
              type="text"
              bind:value={category}
              placeholder="e.g. Frontend"
              class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div class="space-y-1">
            <label for="task-duedate" class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Due Date
            </label>
            <input
              id="task-duedate"
              type="date"
              bind:value={dueDate}
              class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            />
          </div>
        </div>

        <!-- Tags Input Section -->
        <div class="space-y-2">
          <label for="task-tags" class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Tags (#tag)
          </label>
          <div class="flex gap-2">
            <input
              id="task-tags"
              type="text"
              bind:value={tagInput}
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type tag and press enter..."
              class="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onclick={addTag}
              class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            {#each tags as tag}
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                #{tag}
                <button type="button" onclick={() => removeTag(tag)} class="hover:text-rose-500">
                  <X class="w-2.5 h-2.5" />
                </button>
              </span>
            {/each}
          </div>
        </div>

      </form>

      <!-- Fixed Action Footer (shrink-0) -->
      <div class="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#070a13]/80 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onclick={() => taskStore.closeModal()}
          class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="task-modal-form"
          class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{taskStore.editingTaskId ? 'Save Changes' : 'Create Task'}</span>
        </button>
      </div>

    </div>
  </div>
{/if}
