// Section 3: sanitization by security context. The page (security-lab, production build) binds a hostile value to an
// HTML, a URL and a style target; the development-mode warnings exist only under `ng test`.
import { expect, test } from '@playwright/test';
import { newRun, SEC_ORIGIN } from '../support/security.js';

test('Section 3: the production build sanitizes without a console warning', async ({ context, page }) => {
  await newRun(context);
  const messages: string[] = [];
  page.on('console', (message) => messages.push(`${message.type()}: ${message.text()}`));

  await page.goto(`${SEC_ORIGIN}/m33/sanitize`);
  await expect(page.getByRole('heading', { name: 'Sanitization by context' })).toBeVisible();

  // HTML context: formatting stays; the script, the handler, the style attribute and the id go.
  const html = page.getByRole('region', { name: 'HTML context' }).locator('div');
  await expect(html).toHaveJSProperty('innerHTML', '<b>hi</b><i>x</i><p class="c">t</p>');
  // URL context: the javascript: URL is prefixed.
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', 'unsafe:javascript:window.__m33Hits=1');
  // Style context: the value reaches the element as written.
  await expect(page.getByText('Styled')).toHaveAttribute('style', 'background-image: url("javascript:window.__m33Hits=1");');

  expect(await page.evaluate(() => Reflect.get(window, '__m33Hits') ?? 0)).toBe(0);
  // No warning from Angular. The one error is Chromium refusing to load the `javascript:` image URL that the style kept.
  expect(messages.filter((message) => message.startsWith('warning'))).toEqual([]);
  expect(messages.filter((message) => message.startsWith('error'))).toEqual(['error: Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME']);
});
