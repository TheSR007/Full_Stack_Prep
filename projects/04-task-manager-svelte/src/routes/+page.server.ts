import type { PageServerLoad, Actions } from './$types';
import { seedTasks } from '$lib/data/seedTasks';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  return {
    tasks: seedTasks
  };
};

export const actions: Actions = {
  createTask: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString() || '';
    const priority = formData.get('priority')?.toString() || 'medium';
    const category = formData.get('category')?.toString() || 'General';
    const dueDate = formData.get('dueDate')?.toString() || '';

    if (!title || title.trim().length === 0) {
      return fail(400, { title, error: 'Task title is required' });
    }

    return {
      success: true,
      newTask: {
        id: `task-${crypto.randomUUID()}`,
        title,
        description,
        status: 'todo',
        priority,
        category,
        dueDate,
        createdAt: new Date().toISOString()
      }
    };
  },

  updateStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const status = formData.get('status')?.toString();

    if (!id || !status) {
      return fail(400, { error: 'Task ID and status are required' });
    }

    return { success: true, id, status };
  },

  deleteTask: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();

    if (!id) {
      return fail(400, { error: 'Task ID is required' });
    }

    return { success: true, deletedId: id };
  },

  resetSeed: async () => {
    return { success: true, reset: true };
  }
};
