import { expect, test } from '@playwright/test';
import { ORIGIN } from '../support/sw.js';

test('Section 1: a plain HTML page renders the Angular element without an Angular root', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/host/section-1.html`);

  const rating = page.locator('m37-rating');
  await expect(rating).toContainText('Rating: 3');
  expect(await page.locator('app-root, lab-root').count()).toBe(0);

  await rating.evaluate((element) => element.setAttribute('value', '5'));
  await expect(rating).toContainText('Rating: 5');

  await rating.getByRole('button', { name: 'Rate' }).click();
  await expect(page.locator('#log')).toHaveText('rated 5');
  await context.close();
});
