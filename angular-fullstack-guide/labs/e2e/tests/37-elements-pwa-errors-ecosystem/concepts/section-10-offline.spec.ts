import { expect, test } from '@playwright/test';
import { ORIGIN } from '../support/sw.js';

test('Section 10: going offline shows the offline banner and coming back hides it', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/m37/offline`);
  await expect(page.getByRole('heading', { name: 'Offline state' })).toBeVisible();
  await expect(page.getByTestId('offline-banner')).toHaveCount(0);

  await context.setOffline(true);
  await expect(page.getByTestId('offline-banner')).toBeVisible();
  await expect(page.getByTestId('connection')).toHaveAttribute('role', 'status');

  await context.setOffline(false);
  await expect(page.getByTestId('offline-banner')).toHaveCount(0);
  await context.close();
});
