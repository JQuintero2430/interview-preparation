import { test as base } from '@playwright/test';
import { TodosPage } from './todos-page.js';

export const DEFAULT_SEED: readonly string[] = ['Buy milk', 'Walk the dog', 'Write the plan'];

/** What a test may do to its own tenant of the stub server. */
export interface Backend {
  seed(titles?: readonly string[]): Promise<void>;
  requests(): Promise<string[]>;
}

interface TestFixtures {
  backend: Backend;
  todos: TodosPage;
}

interface WorkerFixtures {
  tenant: string;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  tenant: [
    async ({}, use, workerInfo) => {
      await use(`exercise-1-worker-${workerInfo.parallelIndex}`);
    },
    { scope: 'worker' },
  ],
  backend: async ({ context, page, baseURL, tenant }, use) => {
    if (!baseURL) throw new Error('baseURL is required');
    await context.addCookies([{ name: 'm30-tenant', value: tenant, url: baseURL }]);
    await use({
      seed: async (titles = DEFAULT_SEED) => {
        await page.request.post('/api/__reset', { data: titles.map((title) => ({ title })) });
      },
      requests: async () => {
        const entries = await (await page.request.get('/api/__log')).json();
        return entries.map((entry: { method: string; url: string }) => `${entry.method} ${entry.url}`);
      },
    });
  },
  todos: async ({ page, backend }, use) => {
    await backend.seed();
    await use(new TodosPage(page));
  },
});

export { expect } from '@playwright/test';
