import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { seedTasks } from '$lib/data/seedTasks';

let tasks = [...seedTasks];

export const GET: RequestHandler = async ({ params }) => {
  const task = tasks.find((t) => t.id === params.id);
  if (!task) {
    return json({ error: `Task with ID "${params.id}" not found` }, { status: 404 });
  }
  return json(task);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const index = tasks.findIndex((t) => t.id === params.id);
  if (index === -1) {
    return json({ error: `Task with ID "${params.id}" not found` }, { status: 404 });
  }

  try {
    const updates = await request.json();
    tasks[index] = { ...tasks[index], ...updates };
    return json(tasks[index]);
  } catch {
    return json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  const initialLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== params.id);

  if (tasks.length === initialLength) {
    return json({ error: `Task with ID "${params.id}" not found` }, { status: 404 });
  }

  return json({ success: true, deletedId: params.id });
};
