<script lang="ts">
  import { page } from '$app/state';
  import { AlertTriangle, ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
  <title>{page.status} — Error | TaskFlow</title>
</svelte:head>

<div class="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
  <div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 max-w-md w-full space-y-4 shadow-xl">
    <div class="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
      <AlertTriangle class="w-8 h-8" />
    </div>

    <h1 class="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
      {page.status}
    </h1>

    <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
      {page.error?.message || 'An unexpected error occurred.'}
    </p>

    <div class="pt-4">
      <a
        href="/"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to Dashboard</span>
      </a>
    </div>
  </div>
</div>
