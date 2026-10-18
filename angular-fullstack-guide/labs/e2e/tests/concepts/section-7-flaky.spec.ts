import { expect, test, type BrowserContext, type Page, type TestInfo } from '@playwright/test';

/** Gives each test (and each repeat) its own server-side data, then seeds it. */
async function seedOwnTenant(page: Page, context: BrowserContext, testInfo: TestInfo, titles: string[]): Promise<void> {
  const tenant = `section-7-${testInfo.testId}-${testInfo.repeatEachIndex}`;
  await context.addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
  await page.request.post('/api/__reset', { data: titles.map((title) => ({ title })) });
}

test('Section 7: waiting for the response replaces a fixed sleep', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Buy milk']);
  await page.request.post('/api/__scenario', { data: { status: 200, delayMs: 1500 } });
  const listResponse = page.waitForResponse((response) => response.url().endsWith('/api/todos') && response.request().method() === 'GET');

  await page.goto('/m30/todos');
  await expect(page.getByRole('status')).toHaveText('Loading…');
  const response = await listResponse;

  expect(response.status()).toBe(200);
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeVisible();
});

test('Section 7: page.clock makes a timer-driven message deterministic', async ({ page }) => {
  await page.clock.install();
  await page.setContent(`
    <p role="status" id="msg"></p>
    <script>setTimeout(() => { document.getElementById('msg').textContent = 'Saved'; }, 5000);</script>
  `);

  await expect(page.getByRole('status')).toHaveText('');
  await page.clock.fastForward(5000);

  await expect(page.getByRole('status')).toHaveText('Saved');
});

test.describe('Section 7 tenants', () => {
  test.describe.configure({ mode: 'parallel' });

  const addSameTitle = async (page: Page, context: BrowserContext, testInfo: TestInfo): Promise<void> => {
    await seedOwnTenant(page, context, testInfo, []);
    await page.goto('/m30/todos');

    await page.getByLabel('New todo').fill('Same title');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('checkbox', { name: 'Same title' })).toHaveCount(1);
  };

  test("Section 7: tests in separate tenants do not see each other's data", async ({ page, context }, testInfo) => {
    await addSameTitle(page, context, testInfo);
  });

  test('Section 7: a parallel sibling in the same file also sees exactly one', async ({ page, context }, testInfo) => {
    await addSameTitle(page, context, testInfo);
  });
});
