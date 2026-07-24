<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import { Sun, Moon, RotateCcw, Database, Sparkles } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Settings — TaskFlow</title>
  <meta name="description" content="Application preferences, theme controls, and local state store reset options." />
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  
  <div class="glass-panel p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-md">
    
    <!-- Title & Description Header -->
    <div class="border-b border-slate-200/80 dark:border-slate-800/80 pb-6 space-y-1">
      <div class="flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-indigo-500" />
        <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">App Settings & Preferences</h1>
      </div>
      <p class="text-xs text-slate-400">
        Customize your theme and manage application state storage options.
      </p>
    </div>

    <!-- Appearance Mode Box -->
    <div class="p-5 rounded-xl bg-slate-100/60 dark:bg-[#070a13]/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Appearance Mode</h3>
        <p class="text-xs text-slate-400">Toggle between Light and Dark mode UI themes.</p>
      </div>

      <button
        onclick={() => taskStore.toggleTheme()}
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#070a13]/80 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shrink-0"
      >
        {#if taskStore.theme === 'dark'}
          <Moon class="w-4 h-4 text-indigo-400" />
          <span>Dark Mode</span>
        {:else}
          <Sun class="w-4 h-4 text-amber-500" />
          <span>Light Mode</span>
        {/if}
      </button>
    </div>

    <!-- Local State Persistence Box -->
    <div class="p-5 rounded-xl bg-slate-100/60 dark:bg-[#070a13]/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
      <div class="flex items-center gap-2">
        <Database class="w-4 h-4 text-indigo-500" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Local State Persistence</h3>
      </div>

      <p class="text-xs text-slate-400 leading-relaxed">
        Tasks and board columns are saved continuously to your local browser storage using Svelte 5 persistence. Clearing data will restore original seed tasks.
      </p>

      <div class="pt-1">
        <button
          onclick={() => taskStore.resetSeed()}
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw class="w-4 h-4" />
          <span>Reset Store to Default Seed</span>
        </button>
      </div>
    </div>

  </div>

</div>
