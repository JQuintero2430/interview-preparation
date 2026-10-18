import { expect, test as base, type Page } from '@playwright/test';

const SEED = ['Buy milk', 'Walk the dog'] as const;

type TenantData = { seed: readonly string[]; reset: () => Promise<void> };

/** Worker-scoped `tenant` (one per parallel worker) and test-scoped `data` (a fresh seed before every test). */
const test = base.extend<{ data: TenantData }, { tenant: string }>({
  tenant: [
    async ({}, use, workerInfo) => {
      await use(`section-8-worker-${workerInfo.parallelIndex}`);
    },
    { scope: 'worker' },
  ],
  data: async ({ context, page, tenant }, use) => {
    await context.addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
    const reset = async (): Promise<void> => {
      await page.request.post('/api/__reset', { data: SEED.map((title) => ({ title })) });
    };
    await reset();
    await use({ seed: SEED, reset });
  },
});

test.describe('Section 8 workers', () => {
  test.describe.configure({ mode: 'parallel' });

  const addInOwnTenant = async (tenant: string, data: TenantData, parallelIndex: number, page: Page): Promise<void> => {
    expect(tenant).toBe(`section-8-worker-${parallelIndex}`);
    await page.goto('/m30/todos');

    await page.getByLabel('New todo').fill(`From worker ${parallelIndex}`);
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('checkbox')).toHaveCount(data.seed.length + 1);
  };

  test('Section 8: each worker gets its own tenant from parallelIndex', async ({ tenant, data, page }, testInfo) => {
    await addInOwnTenant(tenant, data, testInfo.parallelIndex, page);
  });

  test('Section 8: a parallel sibling uses its own worker tenant too', async ({ tenant, data, page }, testInfo) => {
    await addInOwnTenant(tenant, data, testInfo.parallelIndex, page);
  });
});

test('Section 8: a reset seeds a known state for each test', async ({ data, page }) => {
  await page.request.post('/api/todos', { data: { title: 'Left over' } });
  await data.reset();

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox')).toHaveCount(data.seed.length);
  for (const title of data.seed) {
    await expect(page.getByRole('checkbox', { name: title })).toBeVisible();
  }
  await expect(page.getByRole('checkbox', { name: 'Left over' })).toHaveCount(0);
});
