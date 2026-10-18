import { expect, test } from '@playwright/test';
import { codePoints, localeUrl } from '../support/i18n.js';

test('Section 2: Chromium formats the en-US short time with the separator the run shows', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US', timezoneId: 'UTC' });
  const page = await context.newPage();

  await page.goto(localeUrl('en-US', 'm34/intl'));

  const text = (await page.getByTestId('short-time').textContent()) ?? '';
  // The run showed '3:30 PM' with U+0020 between the time and PM: no character above U+007E, so codePoints is empty.
  expect(text).toBe('3:30 PM');
  expect(codePoints(text), `code points above U+007E in "${text}"`).toBe('');
  await context.close();
});
