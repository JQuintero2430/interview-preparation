import { expect, test, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const TODOS = '**/api/todos';
const HAR = fileURLToPath(new URL('./hars/todos.har', import.meta.url));

/** Gives each test (and each repeat) its own server-side data, then seeds it. */
async function seedOwnTenant(page: Page, context: BrowserContext, testInfo: TestInfo, titles: string[]): Promise<void> {
  const tenant = `section-5-${testInfo.testId}-${testInfo.repeatEachIndex}`;
  await context.addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
  await page.request.post('/api/__reset', { data: titles.map((title) => ({ title })) });
}

async function serverLog(page: Page): Promise<{ method: string; url: string }[]> {
  return (await page.request.get('/api/__log')).json();
}

test('Section 5: page.route fulfills the list request without the server', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Buy milk']);
  await page.route(TODOS, (route) => route.fulfill({ json: [{ id: 99, title: 'From the mock', done: false }] }));

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox', { name: 'From the mock' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toHaveCount(0);
  expect(await serverLog(page)).toEqual([]);
});

test('Section 5: the last registered route handles the request first', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, []);
  const order: string[] = [];
  await page.route(TODOS, (route) => {
    order.push('A');
    return route.fulfill({ json: [{ id: 1, title: 'From A', done: false }] });
  });
  await page.route(TODOS, (route) => {
    order.push('B');
    return route.fulfill({ json: [{ id: 2, title: 'From B', done: false }] });
  });

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox', { name: 'From B' })).toBeVisible();
  expect(order).toEqual(['B']);
});

test('Section 5: route.fallback hands the request to the earlier handler', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, []);
  const order: string[] = [];
  await page.route(TODOS, (route) => {
    order.push('A');
    return route.fulfill({ json: [{ id: 1, title: 'From A', done: false }] });
  });
  await page.route(TODOS, (route) => {
    order.push('B');
    return route.fallback();
  });

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox', { name: 'From A' })).toBeVisible();
  expect(order).toEqual(['B', 'A']);
});

test('Section 5: an unrouted request reaches the stub server', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Buy milk', 'Walk the dog']);
  let handled = 0;
  await page.route('**/api/unrelated', (route) => {
    handled += 1;
    return route.fulfill({ json: [] });
  });

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeVisible();
  expect(handled).toBe(0);
  expect(await serverLog(page)).toEqual([{ method: 'GET', url: '/api/todos' }]);
});

test('Section 5: routeFromHAR replays a recorded response', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Only on the server']);
  await page.routeFromHAR(HAR, { url: '**/api/**' });

  await page.goto('/m30/todos');

  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Only on the server' })).toHaveCount(0);

  // A request that is not in the HAR is aborted by default (`notFound: 'abort'`).
  const aborted = await page.evaluate(() => fetch('/api/todos/999', { method: 'DELETE' }).then(() => 'answered', () => 'aborted'));
  expect(aborted).toBe('aborted');

  // With `notFound: 'fallback'` the same request goes to the stub server, which answers 404.
  await page.unrouteAll();
  await page.routeFromHAR(HAR, { url: '**/api/**', notFound: 'fallback' });
  const status = await page.evaluate(() => fetch('/api/todos/999', { method: 'DELETE' }).then((response) => response.status));
  expect(status).toBe(404);
  expect(await serverLog(page)).toEqual([{ method: 'DELETE', url: '/api/todos/999' }]);
});
