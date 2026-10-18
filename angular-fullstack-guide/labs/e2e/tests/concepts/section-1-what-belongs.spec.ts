import { expect, test, type BrowserContext, type TestInfo } from '@playwright/test';

/** Gives each test (and each repeat) its own server-side data, so parallel runs never share todos. */
async function useOwnTenant(context: BrowserContext, testInfo: TestInfo): Promise<void> {
  const tenant = `section-1-${testInfo.testId}-${testInfo.repeatEachIndex}`;
  await context.addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
}

test('Section 1: the add-todo journey runs on the production build in a real browser', async ({
  page,
  context,
  browserName,
}, testInfo) => {
  await useOwnTenant(context, testInfo);
  await page.request.post('/api/__reset', { data: [] });

  const html = await (await page.request.get('/m30/todos')).text();
  expect(html).toMatch(/<script src="main-[A-Z0-9]{8}\.js" type="module"><\/script>/);
  expect(browserName).toBe('chromium');

  await page.goto('/m30/todos');
  await expect(page.getByText('No todos yet')).toBeVisible();
  await page.getByLabel('New todo').fill('Book the venue');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('status')).toHaveText('Saved');

  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Book the venue' })).toBeVisible();
});

test('Section 1: a deep link to a lazy route is served by the server fallback', async ({ page, context }, testInfo) => {
  await useOwnTenant(context, testInfo);
  await page.request.post('/api/__reset', { data: [{ title: 'Buy milk' }, { title: 'Walk the dog' }] });

  const response = await page.goto('/m30/todos?q=milk');

  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toBe('text/html; charset=utf-8');
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeVisible();
});
