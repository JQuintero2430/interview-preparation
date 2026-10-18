import { expect, test } from '@playwright/test';
import { ORIGIN, swContext, waitForController } from '../support/sw.js';

test('Section 4: the production build registers ngsw-worker.js and controls the page after a reload', async ({ browser }) => {
  const context = await swContext(browser);
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);
  await expect(page.getByTestId('build')).toHaveText('v1');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);

  const script = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '');
  expect(script).toBe(`${ORIGIN}/ngsw-worker.js`);
  await context.close();
});

test('Section 4: ngsw.json lists hashed files and the appData from the config', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);
  const manifest: { configVersion: number; appData: { version: string }; index: string; hashTable: Record<string, string> } = await page.evaluate(() =>
    fetch('/ngsw.json').then((response) => response.json()),
  );

  expect(manifest.configVersion).toBe(1);
  expect(manifest.appData.version).toBe('v1');
  expect(manifest.index).toBe('/index.html');
  const files = Object.keys(manifest.hashTable);
  expect(files).toContain('/index.html');
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) expect(manifest.hashTable[file]).toMatch(/^[0-9a-f]{40}$/);
  await context.close();
});

test('Section 4: a context with service workers blocked serves the same page without a controller', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);
  await expect(page.getByTestId('build')).toHaveText('v1');
  await page.reload();
  await expect(page.getByTestId('build')).toHaveText('v1');
  expect(await page.evaluate(() => navigator.serviceWorker.controller === null)).toBe(true);
  await context.close();
});
