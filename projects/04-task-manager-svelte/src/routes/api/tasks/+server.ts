import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { seedTasks } from '$lib/data/seedTasks';

let tasks = [...seedTasks];

export const GET: RequestHandler = async ({ url }) => {
  const priority = url.searchParams.get('priority');
  const category = url.searchParams.get('category');

  let filtered = [...tasks];

  if (priority && priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }

  return json({
    total: filtered.length,
    tasks: filtered
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.title || body.title.trim() === '') {
      return json({ error: 'Task title is required' }, { status: 400 });
    }

    const newTask = {
      id: `task-${crypto.randomUUID()}`,
      title: body.title,
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      category: body.category || 'General',
      tags: body.tags || [],
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    tasks = [newTask, ...tasks];

    return json(newTask, { status: 201 });
  } catch {
    return json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
};
