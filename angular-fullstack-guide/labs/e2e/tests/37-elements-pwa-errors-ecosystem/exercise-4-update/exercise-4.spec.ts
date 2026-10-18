import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { ORIGIN, deploy, swContext, waitForController } from '../support/sw.js';

// Criteria 1, 2 and 5 of Exercise 37.4 in Chromium; criteria 3 and 4 run in `ng test` against a fake `SwUpdate`.
// Every test owns its context, so the `m37-deploy` cookie (which build the server sends) is per test, never shared.
// Updates are triggered by the page's "Check for update" button (`SwUpdate.checkForUpdate()`), never by the worker's idle timer.
// Offline mechanism (C10, as section 5 recorded): `context.setOffline(true)`, which also fires the window's `offline` event.

/** Opens the variant's shell on v1 in a fresh worker context and reloads it until the worker controls it. */
async function controlledOnV1(context: BrowserContext, variant: string): Promise<Page> {
  await deploy(context, 'v1');
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/ex4/${variant}`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  await expect(page.getByTestId('running')).toHaveText('This tab runs v1');
  return page;
}

/** Deploys v2 for this context and asks the worker to check for it. */
async function deployAndCheck(context: BrowserContext, page: Page): Promise<void> {
  await deploy(context, 'v2');
  await page.getByRole('button', { name: 'Check for update' }).click();
}

for (const variant of ['a', 'b']) {
  test.describe(`Exercise 37.4: update-aware shell, variant ${variant}`, () => {
    test('shows an update banner with the new version when a new version is ready', async ({ browser }) => {
      const context = await swContext(browser);
      const page = await controlledOnV1(context, variant);
      const update = page.getByRole('status', { name: 'Update' });
      await expect(update.getByText('Version v2 is ready')).toHaveCount(0);

      await deployAndCheck(context, page);
      await expect(update.getByText('Version v2 is ready')).toBeVisible();
      await expect(update.getByRole('button', { name: 'Reload', exact: true })).toBeVisible();
      await expect(page.getByTestId('running')).toHaveText('This tab runs v1');
      await context.close();
    });

    test('shows the new version after the user accepts the reload', async ({ browser }) => {
      const context = await swContext(browser);
      const page = await controlledOnV1(context, variant);
      await deployAndCheck(context, page);
      const update = page.getByRole('status', { name: 'Update' });
      await expect(update.getByText('Version v2 is ready')).toBeVisible();

      await update.getByRole('button', { name: 'Reload', exact: true }).click();
      await expect(page.getByTestId('running')).toHaveText('This tab runs v2');
      await waitForController(page);
      await expect(page.getByRole('status', { name: 'Update' }).getByText('Version v2 is ready')).toHaveCount(0);
      await context.close();
    });

    test('shows an offline indicator while the network is down', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/m37/ex4/${variant}`);
      await expect(page.getByTestId('running')).toHaveText('This tab runs v1');
      const connection = page.getByRole('status', { name: 'Connection' });
      await expect(connection.getByText('You are offline')).toHaveCount(0);

      await context.setOffline(true);
      await expect(connection.getByText('You are offline')).toBeVisible();

      await context.setOffline(false);
      await expect(connection.getByText('You are offline')).toHaveCount(0);
      await context.close();
    });
  });
}
