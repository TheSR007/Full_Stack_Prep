<script lang="ts">
  import { taskStore } from '$lib/state/taskStore.svelte';
  import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-svelte';

  const icons = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    error: XCircle
  };

  const styles = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80',
    info: 'bg-indigo-950/90 text-indigo-200 border-indigo-800/80',
    warning: 'bg-amber-950/90 text-amber-200 border-amber-800/80',
    error: 'bg-rose-950/90 text-rose-200 border-rose-800/80'
  };
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
  {#each taskStore.toasts as toast (toast.id)}
    {@const Icon = icons[toast.type] || Info}
    <div
      class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-xs font-semibold animate-fade-in {styles[toast.type]}"
    >
      <div class="flex items-center gap-2">
        <Icon class="w-4 h-4 shrink-0" />
        <span>{toast.message}</span>
      </div>
      <button
        onclick={() => taskStore.removeToast(toast.id)}
        class="p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  {/each}
</div>
