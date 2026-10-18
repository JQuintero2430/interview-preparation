import { expect, test } from '@playwright/test';
import { ORIGIN } from '../support/sw.js';

test('Section 3: an element with ShadowDom keeps its styles out of the host page', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/host/two.html`);

  const inside = page.locator('m37-shadow-note').getByText('Inside the shadow root');
  await expect(inside).toBeVisible();
  await expect(inside).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(page.locator('#host-note')).toHaveCSS('color', 'rgb(0, 0, 255)');

  const hasShadowRoot = await page.locator('m37-shadow-note').evaluate((element) => element.shadowRoot !== null);
  expect(hasShadowRoot).toBe(true);
  await context.close();
});
