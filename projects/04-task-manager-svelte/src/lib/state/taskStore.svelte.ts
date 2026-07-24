import type { Task, TaskStatus, TaskPriority, ToastMessage } from '$lib/types/task';
import { seedTasks } from '$lib/data/seedTasks';

class TaskStore {
  tasks = $state<Task[]>([]);
  searchQuery = $state<string>('');
  selectedPriority = $state<string>('all');
  selectedCategory = $state<string>('all');
  sortBy = $state<'created' | 'due' | 'priority' | 'title'>('created');
  theme = $state<'dark' | 'light'>('dark');
  toasts = $state<ToastMessage[]>([]);
  isModalOpen = $state<boolean>(false);
  editingTaskId = $state<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('taskflow-theme') as 'dark' | 'light';
      if (savedTheme) {
        this.theme = savedTheme;
      }

      const savedTasks = localStorage.getItem('taskflow-svelte-tasks');
      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks);
        } catch {
          this.tasks = seedTasks;
        }
      } else {
        this.tasks = seedTasks;
      }

      this.applyTheme(this.theme);
    }
  }

  // Derived: Case-insensitive deduplicated & alphabetically sorted category list
  categories = $derived.by(() => {
    const map = new Map<string, string>();
    this.tasks.forEach((t) => {
      if (t.category && t.category.trim() !== '') {
        const lower = t.category.trim().toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, t.category.trim());
        }
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  });

  // Derived: Filtered and Sorted Tasks
  filteredTasks = $derived.by(() => {
    return this.tasks
      .filter((task) => {
        const matchesSearch =
          this.searchQuery.trim() === '' ||
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesPriority =
          this.selectedPriority === 'all' || task.priority === this.selectedPriority;

        const matchesCategory =
          this.selectedCategory === 'all' ||
          task.category.toLowerCase() === this.selectedCategory.toLowerCase();

        return matchesSearch && matchesPriority && matchesCategory;
      })
      .sort((a, b) => {
        if (this.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (this.sortBy === 'due') {
          return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
        }
        if (this.sortBy === 'priority') {
          const weights: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        // Default: created date descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  });

  // Derived Stats
  stats = $derived.by(() => {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.status === 'completed').length;
    const inProgress = this.tasks.filter((t) => t.status === 'in_progress').length;
    const urgent = this.tasks.filter((t) => t.priority === 'urgent').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, urgent, completionRate };
  });

  // Actions
  initializeFromSSR(ssrTasks: Task[]) {
    if (this.tasks.length === 0 && ssrTasks && ssrTasks.length > 0) {
      this.tasks = ssrTasks;
      this.persist();
    }
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
      ...taskData,
      id: `task-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.tasks = [newTask, ...this.tasks];
    this.persist();
    this.addToast('success', `Task "${newTask.title}" created successfully.`);
  }

  updateTask(id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    this.persist();
    this.addToast('info', 'Task updated successfully.');
  }

  updateStatus(id: string, status: TaskStatus) {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, status } : t));
    this.persist();
  }

  deleteTask(id: string) {
    const taskToDelete = this.tasks.find((t) => t.id === id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persist();
    this.addToast('warning', `Task "${taskToDelete?.title || id}" deleted.`);
  }

  resetSeed() {
    this.tasks = seedTasks;
    this.persist();
    this.addToast('info', 'Reset task store to default seed tasks.');
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow-theme', this.theme);
      this.applyTheme(this.theme);
    }
  }

  addToast(type: 'success' | 'info' | 'warning' | 'error', message: string) {
    const id = crypto.randomUUID();
    this.toasts = [...this.toasts, { id, type, message }];
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  openModal(taskId?: string) {
    this.editingTaskId = taskId || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingTaskId = null;
  }

  private applyTheme(t: 'dark' | 'light') {
    if (typeof window !== 'undefined') {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow-svelte-tasks', JSON.stringify(this.tasks));
    }
  }
}

export const taskStore = new TaskStore();
