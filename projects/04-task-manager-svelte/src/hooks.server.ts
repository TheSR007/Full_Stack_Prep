import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const start = Date.now();

  const response = await resolve(event);

  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Framework', 'SvelteKit-Svelte5');

  return response;
};
