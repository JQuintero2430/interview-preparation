import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { ORIGIN, swContext, waitForController } from '../support/sw.js';

// Offline mechanism (C10): `context.setOffline(true)`, which the run showed also makes the worker's own fetches fail.
async function goOffline(context: BrowserContext): Promise<void> {
  await context.setOffline(true);
}

/** Opens the caching page in a fresh worker context and reloads it until the worker controls it. */
async function controlled(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/caching`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  await expect(page.getByRole('heading', { name: 'Caching lab' })).toBeVisible();
  return page;
}

/** The hit number the page shows for an endpoint (the server's global counter at the time it answered). */
async function shownHit(page: Page, testId: string): Promise<number> {
  const text = (await page.getByTestId(testId).textContent()) ?? '';
  return Number(/hit (\d+)$/.exec(text)?.[1] ?? Number.NaN);
}

/** Polls until some cache the worker keeps holds a response for `path`. */
async function waitForCached(page: Page, path: string): Promise<void> {
  await expect.poll(() => page.evaluate((url) => caches.match(url).then((found) => found !== undefined), path)).toBe(true);
}

test('Section 5: a deep link loads offline from the cached index.html', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlled(context);
  await waitForCached(page, '/index.html');

  await goOffline(context);
  await page.goto(`${ORIGIN}/m37/caching`);
  await expect(page.getByRole('heading', { name: 'Caching lab' })).toBeVisible();
  await context.close();
});

test('Section 5: a performance data group answers offline from the cache without reaching the server', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlled(context);

  await page.getByRole('button', { name: 'Load catalog', exact: true }).click();
  await expect(page.getByTestId('catalog-result')).toContainText('catalog hit');
  const online = await shownHit(page, 'catalog-result');
  await waitForCached(page, '/api/m37/catalog');

  await goOffline(context);
  await page.getByRole('button', { name: 'Load catalog with bypass' }).click();
  await expect(page.getByTestId('catalog-result')).toHaveText('catalog failed');
  await page.getByRole('button', { name: 'Load catalog', exact: true }).click();
  await expect(page.getByTestId('catalog-result')).toHaveText(`catalog hit ${online}`);
  await context.close();
});

test('Section 5: a freshness data group goes to the network while online', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlled(context);

  await page.getByRole('button', { name: 'Load prices' }).click();
  await expect(page.getByTestId('prices-result')).toContainText('prices hit');
  const first = await shownHit(page, 'prices-result');
  await page.getByRole('button', { name: 'Load prices' }).click();
  await expect.poll(() => shownHit(page, 'prices-result')).toBeGreaterThan(first);
  await context.close();
});

test('Section 5: a request outside every data group fails offline', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlled(context);

  await page.getByRole('button', { name: 'Load uncached' }).click();
  await expect(page.getByTestId('uncached-result')).toContainText('uncached hit');

  await goOffline(context);
  await page.getByRole('button', { name: 'Load uncached' }).click();
  await expect(page.getByTestId('uncached-result')).toHaveText('uncached failed');
  await context.close();
});

test('Section 5: a request with ngsw-bypass skips the worker', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlled(context);

  await page.getByRole('button', { name: 'Load catalog', exact: true }).click();
  await expect(page.getByTestId('catalog-result')).toContainText('catalog hit');
  const first = await shownHit(page, 'catalog-result');
  await waitForCached(page, '/api/m37/catalog');

  await page.getByRole('button', { name: 'Load catalog with bypass' }).click();
  await expect.poll(() => shownHit(page, 'catalog-result')).toBeGreaterThan(first);
  await page.getByRole('button', { name: 'Load catalog', exact: true }).click();
  await expect(page.getByTestId('catalog-result')).toHaveText(`catalog hit ${first}`);
  await context.close();
});
