import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { ORIGIN, deploy, swContext, waitForController } from '../support/sw.js';

// Output answers of the question bank (module 37), browser half. Each `describe` is one question; later questions append below.
// Every test owns its context and sets `serviceWorkers` through `swContext`. Offline is `context.setOffline(true)` (C10, as section 5 recorded).

/** Opens a page in a fresh worker context and reloads it until the worker controls it. */
async function controlled(context: BrowserContext, path: string, heading: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`${ORIGIN}${path}`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  return page;
}

/** Polls until some cache the worker keeps holds a response for `path`. */
async function waitForCached(page: Page, path: string): Promise<void> {
  await expect.poll(() => page.evaluate((url) => caches.match(url).then((found) => found !== undefined), path)).toBe(true);
}

/** The hit number in a result line such as `catalog hit 3`. */
function hitNumber(text: string | null): number {
  return Number(/hit (\d+)$/.exec(text ?? '')?.[1] ?? Number.NaN);
}

test.describe('Q37.11 offline after one visit with the lab config', () => {
  test('Q37.11 the deep link, the catalog and the prices load offline; the uncached endpoint fails', async ({ browser }) => {
    const context = await swContext(browser);
    const page = await controlled(context, '/m37/outputs/q11', 'Offline outputs lab');

    await page.getByRole('button', { name: 'Load all three' }).click();
    await expect(page.getByTestId('uncached-result')).toContainText('uncached hit');
    await expect(page.getByTestId('catalog-result')).toContainText('catalog hit');
    await expect(page.getByTestId('prices-result')).toContainText('prices hit');
    const catalogOnline = hitNumber(await page.getByTestId('catalog-result').textContent());
    const pricesOnline = hitNumber(await page.getByTestId('prices-result').textContent());
    await waitForCached(page, '/api/m37/catalog');
    await waitForCached(page, '/api/m37/prices');

    await context.setOffline(true);
    await page.goto(`${ORIGIN}/m37/outputs/q11`);
    await expect(page.getByRole('heading', { name: 'Offline outputs lab' })).toBeVisible();
    await page.getByRole('button', { name: 'Load all three' }).click();
    await expect(page.getByTestId('uncached-result')).toHaveText('uncached failed');
    await expect(page.getByTestId('catalog-result')).toHaveText(`catalog hit ${catalogOnline}`);
    await expect(page.getByTestId('prices-result')).toHaveText(`prices hit ${pricesOnline}`);
    await context.setOffline(false);
    await context.close();
  });
});

test.describe('Q37.12 two tabs and one update', () => {
  test('Q37.12 tab A sees DETECTED then READY and stays on v1; tab B opens on v2; A shows v2 after its reload', async ({ browser }) => {
    const context = await swContext(browser);
    await deploy(context, 'v1');
    const tabA = await controlled(context, '/m37/outputs/q12', 'Version outputs lab');
    await expect(tabA.getByTestId('running')).toHaveText('This tab runs v1');

    // Only the events this question is about: an idle navigation check may add NO_NEW_VERSION_DETECTED lines.
    const updateEvents = (page: Page): Promise<string[]> =>
      page
        .getByTestId('events')
        .getByRole('listitem')
        .allTextContents()
        .then((lines) => lines.filter((line) => !line.startsWith('NO_NEW_VERSION_DETECTED')));

    await deploy(context, 'v2');
    await tabA.getByRole('button', { name: 'Check for update' }).click();
    await expect(tabA.getByTestId('check-result')).toHaveText('check true');
    await expect.poll(() => updateEvents(tabA)).toEqual(['VERSION_DETECTED v2', 'VERSION_READY v1 -> v2']);
    await expect(tabA.getByTestId('running')).toHaveText('This tab runs v1');

    const tabB = await context.newPage();
    await tabB.goto(`${ORIGIN}/m37/outputs/q12`);
    await waitForController(tabB);
    await expect(tabB.getByTestId('running')).toHaveText('This tab runs v2');
    await expect(tabA.getByTestId('running')).toHaveText('This tab runs v1');
    expect(await updateEvents(tabA)).toEqual(['VERSION_DETECTED v2', 'VERSION_READY v1 -> v2']);

    await tabA.reload();
    await waitForController(tabA);
    await expect(tabA.getByTestId('running')).toHaveText('This tab runs v2');
    await expect(tabB.getByTestId('running')).toHaveText('This tab runs v2');
    await context.close();
  });
});

test.describe('Q37.17 a recording ErrorHandler with the global listeners on: the browser half', () => {
  test('Q37.17 click, setTimeout and rejection reach the handler in order, the reason unwrapped, and the console shows no uncaught error', async ({ browser }) => {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(`${ORIGIN}/m37/outputs/q17`);
    const log = page.getByTestId('error-log').getByRole('listitem');

    await page.getByRole('button', { name: 'Q17 throw in click' }).click();
    await expect(log).toHaveText(['Error: q17 click boom']);
    await page.getByRole('button', { name: 'Q17 throw in setTimeout' }).click();
    await expect(log).toHaveText(['Error: q17 click boom', 'Error: q17 timeout boom']);
    await page.getByRole('button', { name: 'Q17 reject a promise' }).click();
    await expect(log).toHaveText(['Error: q17 click boom', 'Error: q17 timeout boom', 'string: q17 rejection reason']);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter((text) => text.includes('q17'))).toEqual([]);
    await context.close();
  });
});
