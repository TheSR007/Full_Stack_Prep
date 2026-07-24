<script lang="ts">
  import { page } from '$app/state';
  import { taskStore } from '$lib/state/taskStore.svelte';
  import { LayoutGrid, List, BarChart3, Settings, Sun, Moon, Plus, Search } from 'lucide-svelte';

  const navItems = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/tasks', label: 'List', icon: List },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];
</script>

<header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
  <div class="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 shadow-xl transition-colors duration-200">
    
    <!-- Left Section: Brand Logo & Nav Tabs -->
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-150">
          TM
        </div>
        <span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
          TaskFlow
        </span>
      </a>

      <nav class="hidden md:flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-[#070a13]/80 border border-slate-200/80 dark:border-slate-800/80">
        {#each navItems as item}
          {@const isActive = page.url.pathname === item.href || (item.href !== '/' && page.url.pathname.startsWith(item.href))}
          {@const Icon = item.icon}
          <a
            href={item.href}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 {isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}"
          >
            <Icon class="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </a>
        {/each}
      </nav>
    </div>

    <!-- Right Section: Search, Theme Switcher & CTA -->
    <div class="flex items-center gap-3">
      <!-- Live Search Input -->
      <div class="relative w-36 sm:w-52">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          bind:value={taskStore.searchQuery}
          class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/90 dark:bg-[#070a13]/90 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      <!-- Theme Toggle Button -->
      <button
        onclick={() => taskStore.toggleTheme()}
        aria-label="Toggle theme"
        class="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070a13]/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
      >
        {#if taskStore.theme === 'dark'}
          <Sun class="w-4 h-4 text-amber-400" />
        {:else}
          <Moon class="w-4 h-4 text-indigo-600" />
        {/if}
      </button>

      <!-- CTA Button -->
      <button
        onclick={() => taskStore.openModal()}
        class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all duration-150"
      >
        <Plus class="w-4 h-4" />
        <span class="hidden sm:inline">New Task</span>
      </button>
    </div>

  </div>
</header>
