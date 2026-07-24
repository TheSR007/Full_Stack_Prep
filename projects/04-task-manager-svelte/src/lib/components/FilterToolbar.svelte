<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import { Filter, ArrowUpDown, Tag } from 'lucide-svelte';

  const optionClass = "bg-white text-slate-900 dark:bg-[#0d1322] dark:text-slate-100 py-1";
</script>

<div class="glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
  
  <!-- Left Group: Filters -->
  <div class="flex flex-wrap items-center gap-2">
    <!-- Priority Filter -->
    <div class="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#070a13]/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
      <Filter class="w-3.5 h-3.5 text-indigo-500" />
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority:</span>
      <select
        bind:value={taskStore.selectedPriority}
        class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
      >
        <option value="all" class={optionClass}>All Priorities</option>
        <option value="urgent" class={optionClass}>Urgent</option>
        <option value="high" class={optionClass}>High</option>
        <option value="medium" class={optionClass}>Medium</option>
        <option value="low" class={optionClass}>Low</option>
      </select>
    </div>

    <!-- Dynamic Category Filter -->
    <div class="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#070a13]/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
      <Tag class="w-3.5 h-3.5 text-indigo-500" />
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Category:</span>
      <select
        bind:value={taskStore.selectedCategory}
        class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
      >
        <option value="all" class={optionClass}>All Categories</option>
        {#each taskStore.categories as cat}
          <option value={cat} class={optionClass}>{cat}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Right Group: Sorting Selector -->
  <div class="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#070a13]/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
    <ArrowUpDown class="w-3.5 h-3.5 text-indigo-500" />
    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort By:</span>
    <select
      bind:value={taskStore.sortBy}
      class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
    >
      <option value="created" class={optionClass}>Date Created</option>
      <option value="due" class={optionClass}>Due Date</option>
      <option value="priority" class={optionClass}>Priority Weight</option>
      <option value="title" class={optionClass}>Task Title</option>
    </select>
  </div>

</div>
