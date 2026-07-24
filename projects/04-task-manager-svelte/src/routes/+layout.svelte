<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
  import { taskStore } from '$lib/state/taskStore.svelte';
  import NavigationHeader from '$lib/components/NavigationHeader.svelte';
  import TaskFormModal from '$lib/components/TaskFormModal.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Reactive effect for SSR hydration data in Svelte 5
  $effect(() => {
    if (data?.initialTasks) {
      taskStore.initializeFromSSR(data.initialTasks);
    }
  });

  // View Transitions API integration in SvelteKit
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070a13] dark:text-slate-100 transition-colors duration-200 antialiased font-sans">
  <NavigationHeader />
  
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {@render children()}
  </main>

  <TaskFormModal />
  <ToastContainer />
</div>
