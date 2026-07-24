import type { PageServerLoad } from './$types';
import { seedTasks } from '$lib/data/seedTasks';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const taskId = params.id;
  const task = seedTasks.find((t) => t.id === taskId);

  if (!task && !taskId.startsWith('task-')) {
    throw error(404, { message: `Task with ID "${taskId}" was not found.` });
  }

  return {
    taskId,
    fallbackTask: task || seedTasks[0]
  };
};
