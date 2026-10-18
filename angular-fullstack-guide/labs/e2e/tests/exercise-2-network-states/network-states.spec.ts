import { expect, test as base, type Page } from '@playwright/test';
import { createBackend, type BackendController, type BackendKind } from './backends.js';

const test = base.extend<{ kind: BackendKind; backend: BackendController }>({
  kind: ['route', { option: true }],
  backend: async ({ page, kind }, use, testInfo) => {
    const slug = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    await use(await createBackend(kind, page, `exercise-2-${kind}-${testInfo.parallelIndex}-${slug}`));
  },
});

const TODOS = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Walk the dog', done: false },
];

const ui = (page: Page) => ({
  loading: page.getByRole('status'),
  error: page.getByRole('alert'),
  retry: page.getByRole('button', { name: 'Retry' }),
  rows: page.getByRole('listitem'),
  empty: page.getByText('No todos yet'),
});

const criteria: ReadonlyArray<readonly [string, (page: Page, backend: BackendController) => Promise<void>]> = [
  [
    'shows a loading message while the list request is pending',
    async (page, backend) => {
      await backend.respondWith({ delayMs: 1_000, body: TODOS });
      await page.goto('/m30/todos');

      await expect(ui(page).loading).toHaveText('Loading…');
      await expect(ui(page).rows).toHaveCount(2);
      await expect(ui(page).loading).toHaveCount(0);
    },
  ],
  [
    'shows an error message and a retry button when the server fails',
    async (page, backend) => {
      await backend.respondWith({ status: 500 });
      await page.goto('/m30/todos');

      await expect(ui(page).error).toHaveText('Could not load todos');
      await expect(ui(page).retry).toBeVisible();
    },
  ],
  [
    'shows the list after a successful retry',
    async (page, backend) => {
      await backend.respondWith({ status: 500 });
      await page.goto('/m30/todos');
      await expect(ui(page).retry).toBeVisible();

      await backend.respondWith({ body: TODOS });
      await ui(page).retry.click();

      await expect(ui(page).rows).toHaveText(['Buy milk Delete', 'Walk the dog Delete']);
      await expect(ui(page).error).toHaveCount(0);
    },
  ],
  [
    'shows the empty state for an empty list',
    async (page, backend) => {
      await backend.respondWith({ body: [] });
      await page.goto('/m30/todos');

      await expect(ui(page).empty).toBeVisible();
      await expect(ui(page).rows).toHaveCount(0);
    },
  ],
  [
    'waits for a slow response without a fixed sleep',
    async (page, backend) => {
      await backend.respondWith({ delayMs: 2_000, body: TODOS });
      const started = Date.now();
      await page.goto('/m30/todos');

      await expect(ui(page).rows).toHaveCount(2);
      expect(Date.now() - started).toBeGreaterThanOrEqual(2_000);
    },
  ],
  [
    'makes no API call the test did not script',
    async (page, backend) => {
      await backend.respondWith({ body: TODOS });
      await page.goto('/m30/todos');
      await expect(ui(page).rows).toHaveCount(2);

      expect(await backend.unexpectedCalls()).toEqual([]);
    },
  ],
];

const variants: ReadonlyArray<readonly [string, BackendKind]> = [
  ['page.route mocks', 'route'],
  ['stub server scenario endpoint', 'server'],
];

for (const [name, kind] of variants) {
  test.describe(`E30.2 network states (${name})`, () => {
    test.use({ kind });

    for (const [title, run] of criteria) {
      test(title, async ({ page, backend }) => {
        await run(page, backend);
      });
    }
  });
}
