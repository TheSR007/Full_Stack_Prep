import type { LayoutServerLoad } from './$types';
import { seedTasks } from '$lib/data/seedTasks';

export const load: LayoutServerLoad = async () => {
  return {
    initialTasks: seedTasks
  };
};
