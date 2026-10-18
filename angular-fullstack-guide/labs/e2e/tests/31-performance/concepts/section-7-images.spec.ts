import { expect, test } from '@playwright/test';
import { collectEntries } from '../support/perf.js';

test('Section 7: the priority hero image is the LCP element on the landing page', async ({ page }) => {
  await page.goto('/m31/home');

  const hero = page.getByRole('img', { name: 'Module 31 hero banner' });
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).toHaveAttribute('loading', 'eager');

  // The heading paints first; the last entry is the one that counts, so wait for it to name the image.
  await expect
    .poll(async () => {
      const entries = await collectEntries(page, 'largest-contentful-paint');
      return entries.at(-1)?.element;
    })
    .toBe('IMG');
});
