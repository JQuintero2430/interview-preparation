import { expect, test, type Browser } from '@playwright/test';
import { localeUrl, type I18nLocale } from '../support/i18n.js';

const COUNTS = ['0', '1', '2', '3', '11'] as const;

// Presses each count button and expects the text of that build, in order. The source (en-US) has an exact =0
// case; the French translation has none, and the Arabic one has every category Arabic uses.
async function expectItemTexts(browser: Browser, locale: I18nLocale, expected: readonly string[]): Promise<void> {
  const context = await browser.newContext({ locale, timezoneId: 'UTC' });
  const page = await context.newPage();
  await page.goto(localeUrl(locale, 'm34/icu'));
  for (const [index, count] of COUNTS.entries()) {
    await page.getByRole('button', { name: count, exact: true }).click();
    await expect(page.getByTestId('items'), `after pressing ${count}`).toHaveText(expected[index]);
  }
  await context.close();
}

test('Section 5: the French build uses one for zero and one item', async ({ browser }) => {
  // French `one` covers 0 and 1, so "0 article" is correct French; `other` starts at 2.
  await expectItemTexts(browser, 'fr', ['0 article', '1 article', '2 articles', '3 articles', '11 articles']);
});

test('Section 5: the Arabic build uses the zero, one, two, few and many branches', async ({ browser }) => {
  await expectItemTexts(browser, 'ar', ['لا عناصر', 'عنصر واحد', 'عنصران', '3 عناصر', '11 عنصرًا']);
});
