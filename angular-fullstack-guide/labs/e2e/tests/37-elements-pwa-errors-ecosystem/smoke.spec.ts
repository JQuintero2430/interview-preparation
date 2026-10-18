import { expect, test } from '@playwright/test';
import { ORIGIN, swContext, swState, waitForController } from './support/sw.js';

test('Smoke: the elements lab serves v1 and registers the service worker', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Module 37 elements, PWA and errors lab' })).toBeVisible();
  await expect(page.getByTestId('build')).toHaveText('v1');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  expect(await swState(page)).toContain('NORMAL');
  await context.close();
});

test('Smoke: the host page upgrades a custom element from the widgets bundle', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/host/hello.html`);
  await expect(page.locator('m37-hello')).toContainText('Hello, host');
  await context.close();
});

test('Smoke: the elements lab makes no request outside localhost', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  await page.goto(`${ORIGIN}/`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) expect(url.startsWith(ORIGIN)).toBe(true);
  await context.close();
});
