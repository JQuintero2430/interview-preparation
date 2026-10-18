import { expect, test } from '@playwright/test';

test('Smoke: Chromium launches and clicks a button', async ({ page, browserName }) => {
  await page.setContent(`
    <button type="button" onclick="document.querySelector('output').textContent = 'clicked'">Click me</button>
    <output></output>
  `);

  await page.getByRole('button', { name: 'Click me' }).click();

  expect(browserName).toBe('chromium');
  await expect(page.locator('output')).toHaveText('clicked');
});
