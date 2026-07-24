import type { Task } from '$lib/types/task';

export const seedTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Architect Svelte 5 Runes State Store',
    description: 'Implement reactive global task management using $state, $derived, and $effect in Svelte 5.',
    status: 'completed',
    priority: 'urgent',
    category: 'Architecture',
    tags: ['svelte5', 'runes', 'frontend'],
    dueDate: '2026-07-26',
    createdAt: '2026-07-24T10:00:00.000Z'
  },
  {
    id: 'task-2',
    title: 'Build Glassmorphic Header & Navigation',
    description: 'Create sticky glassmorphic navigation header with backdrop blur and active route pills.',
    status: 'in_progress',
    priority: 'high',
    category: 'UI/UX',
    tags: ['glassmorphism', 'tailwind', 'components'],
    dueDate: '2026-07-28',
    createdAt: '2026-07-24T11:30:00.000Z'
  },
  {
    id: 'task-3',
    title: 'Setup SvelteKit Server Form Actions',
    description: 'Configure progressive enhancement form actions for create, update status, and delete mutations.',
    status: 'todo',
    priority: 'medium',
    category: 'Backend',
    tags: ['ssr', 'form-actions', 'sveltekit'],
    dueDate: '2026-07-30',
    createdAt: '2026-07-24T14:15:00.000Z'
  },
];
