import { expect, test } from '@playwright/test';
import { ORIGIN } from '../support/sw.js';

test('Section 8: a setTimeout error reaches the error log through the global listener', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/errors`);

  await page.getByRole('button', { name: 'Throw in setTimeout' }).click();

  await expect(page.getByTestId('error-log').getByRole('listitem')).toHaveText(['Error: m37 timeout error']);
  await context.close();
});

test('Section 8: an unhandled rejection reaches the error log with its reason', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/errors`);

  await page.getByRole('button', { name: 'Reject a promise' }).click();

  await expect(page.getByTestId('error-log').getByRole('listitem')).toHaveText(['Error: m37 rejection reason']);
  await context.close();
});

test('Section 8: the browser console shows no uncaught error for a forwarded error', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`${ORIGIN}/m37/errors`);

  await page.getByRole('button', { name: 'Throw in setTimeout' }).click();
  await expect(page.getByTestId('error-log').getByRole('listitem')).toHaveText(['Error: m37 timeout error']);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors.filter((text) => text.includes('m37 timeout error'))).toEqual([]);
  await context.close();
});
