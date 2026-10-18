import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { ORIGIN, deploy, swContext, waitForController } from '../support/sw.js';

// Every test owns its context, so the `m37-deploy` cookie (which build the server sends) is per test, never shared.
// Updates are triggered by the page's "Check for update" button (`SwUpdate.checkForUpdate()`), never by the worker's idle timer.

/** Opens the updates page on v1 in a fresh worker context and reloads it until the worker controls it. */
async function controlledOnV1(context: BrowserContext): Promise<Page> {
  await deploy(context, 'v1');
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/updates`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  await expect(page.getByTestId('running')).toHaveText('This tab runs v1');
  return page;
}

/** The lines of the page's `versionUpdates` list. */
function events(page: Page): Promise<string[]> {
  return page.getByTestId('events').getByRole('listitem').allTextContents();
}

/** Deploys v2 for this context and asks the worker to check, then waits until the page has listed VERSION_READY. */
async function updateTo2(context: BrowserContext, page: Page): Promise<void> {
  await deploy(context, 'v2');
  await page.getByRole('button', { name: 'Check for update' }).click();
  await expect.poll(() => events(page)).toContain('VERSION_READY v1 -> v2');
}

/** The main script the document itself loaded. */
function loadedMain(page: Page): Promise<string> {
  return page.evaluate(() => document.querySelector('script[src^="main-"]')?.getAttribute('src') ?? '');
}

/** The main script named by the index.html this tab gets through the worker (a page fetch, so the worker answers for this client). */
async function mainServedToTab(page: Page): Promise<string> {
  const html = await page.evaluate(() => fetch('/index.html').then((response) => response.text()));
  return /main-[A-Z0-9]+\.js/.exec(html)?.[0] ?? '';
}

/** The main script named by the index.html the server itself sends to this context (no worker involved). */
async function mainOnServer(context: BrowserContext): Promise<string> {
  const html = await (await context.request.get(`${ORIGIN}/index.html`)).text();
  return /main-[A-Z0-9]+\.js/.exec(html)?.[0] ?? '';
}

test('Section 6: after deploying v2 a checkForUpdate emits VERSION_READY with both appData versions', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlledOnV1(context);

  await updateTo2(context, page);
  await expect(page.getByTestId('check-result')).toHaveText('check true');
  const lines = await events(page);
  expect(lines).toContain('VERSION_DETECTED v2');
  expect(lines.indexOf('VERSION_DETECTED v2')).toBeLessThan(lines.indexOf('VERSION_READY v1 -> v2'));
  await context.close();
});

test('Section 6: the open tab keeps showing v1 until it reloads', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlledOnV1(context);
  await updateTo2(context, page);

  await expect(page.getByTestId('running')).toHaveText('This tab runs v1');
  await expect(page.getByRole('button', { name: 'Reload to update' })).toBeVisible();
  const v1Main = await loadedMain(page);
  expect(await mainServedToTab(page)).toBe(v1Main);
  expect(await mainOnServer(context)).not.toBe(v1Main);
  await context.close();
});

test('Section 6: after a reload the tab shows v2', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await controlledOnV1(context);
  await updateTo2(context, page);

  await page.getByRole('button', { name: 'Reload to update' }).click();
  await expect(page.getByTestId('running')).toHaveText('This tab runs v2');
  await waitForController(page);
  const v2Main = await loadedMain(page);
  expect(await mainServedToTab(page)).toBe(v2Main);
  expect(await mainOnServer(context)).toBe(v2Main);
  await context.close();
});

test('Section 6: a second tab opened after the update gets v2', async ({ browser }) => {
  const context = await swContext(browser);
  const first = await controlledOnV1(context);
  await updateTo2(context, first);

  const second = await context.newPage();
  await second.goto(`${ORIGIN}/m37/updates`);
  await waitForController(second);
  await expect(second.getByTestId('running')).toHaveText('This tab runs v2');
  expect(await mainServedToTab(second)).toBe(await loadedMain(second));

  await expect(first.getByTestId('running')).toHaveText('This tab runs v1');
  expect(await mainServedToTab(first)).toBe(await loadedMain(first));
  expect(await loadedMain(first)).not.toBe(await loadedMain(second));
  await context.close();
});
