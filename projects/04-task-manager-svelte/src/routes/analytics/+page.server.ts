import type { PageServerLoad } from './$types';
import { seedTasks } from '$lib/data/seedTasks';

export const load: PageServerLoad = async () => {
  return {
    tasks: seedTasks
  };
};
