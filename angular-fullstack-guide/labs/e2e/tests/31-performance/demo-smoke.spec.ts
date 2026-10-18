import { expect, test } from '@playwright/test';

test('Smoke: the module 31 home page loads from the production build', async ({ page }) => {
  await page.goto('/m31/home');

  await expect(page.getByRole('heading', { name: 'Module 31 lab' })).toBeVisible();
  const hero = page.getByRole('img', { name: 'Module 31 hero banner' });
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).toHaveJSProperty('naturalWidth', 800);
});
