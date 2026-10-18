// Section 2: Angular's template model. The sinks page (security-lab, nonce build) echoes `?q=` four ways, and
// server/security/02-xss.mjs serves its shell with a literal `{{ 7 * 7 }}` outside the application root.
import { expect, test } from '@playwright/test';
import { newRun, SEC_ORIGIN } from '../support/security.js';

/** The payload only counts: it adds one to `window.__m33Hits`. */
const PAYLOAD = '<img src=x onerror="window.__m33Hits=(window.__m33Hits||0)+1">';
const SINKS = `${SEC_ORIGIN}/m33/xss/sinks`;

test('Section 2: only the direct innerHTML write runs the injected handler', async ({ context, page }) => {
  await newRun(context);
  await page.goto(`${SINKS}?q=${encodeURIComponent(PAYLOAD)}`);

  const direct = page.getByRole('region', { name: 'Direct innerHTML write' });
  await expect(direct.locator('img')).toHaveAttribute('onerror', /__m33Hits/);

  // The write ran once and its handler counted once; the three template regions added none.
  await expect.poll(() => page.evaluate(() => Reflect.get(window, '__m33Hits') ?? 0)).toBe(1);

  const regions = ['Interpolation', 'innerHTML binding', 'textContent binding'];
  for (const name of regions) {
    await expect(page.getByRole('region', { name }).locator('[onerror]')).toHaveCount(0);
  }
  // Interpolation and [textContent] show the payload as text; [innerHTML] keeps a sanitized image.
  await expect(page.getByRole('region', { name: 'Interpolation' })).toContainText(PAYLOAD);
  await expect(page.getByRole('region', { name: 'textContent binding' })).toContainText(PAYLOAD);
  await expect(page.getByRole('region', { name: 'innerHTML binding' }).locator('img')).toHaveCount(1);
});

test('Section 2: interpolation braces in the served HTML are not evaluated', async ({ context, page }) => {
  await newRun(context);
  const served = await context.request.get(`${SINKS}?braces`);
  expect(await served.text()).toContain('<p id="braces">{{ 7 * 7 }}</p>');

  // The browser loads the application over that shell.
  await page.goto(`${SINKS}?braces&q=${encodeURIComponent('{{ 7 * 7 }}')}`);
  await expect(page.getByRole('heading', { name: 'Search results' })).toBeVisible();
  await expect(page.locator('#braces')).toHaveText('{{ 7 * 7 }}'); // plain HTML outside the root: never compiled
  await expect(page.getByRole('region', { name: 'Interpolation' })).toHaveText('{{ 7 * 7 }}'); // a value is data, not a template
});
